import Random from 'random-js';

const random = new Random();
function generateZipkinTraceId() {
  return random.hex(16);
}

export default function attachBeforeSendHeadersListener(
  {Cc, Ci, Cu, pubsub}
) {
  const Options = {
    enable_tracing: true,
    profile_site: {
      test: function() { return true; }
    },
    zipkin_site: 'http://zipkin.io',
    trace_zipkin_ui: 'http://the-zipkin-ui.com/'
  };

  const Traces = {
    add: (traceId, url, referer) => {
      console.log('The referer was', referer);
      pubsub.pub('requestFinished', {
        headers: [{
          name: 'X-B3-TraceId',
          value: traceId

        }],
        url
      });
    }
  };

  // Build the HTTP intercept observer
  var observerService, myObserver = {
    observe: function(subject, topic, data) {
      if (topic == "http-on-modify-request" && Options.enable_tracing) {
        var channel = subject.QueryInterface( Ci.nsIHttpChannel );
        //log("About to run profile_site RegExp");
        try {
          if (Options.profile_site.test(channel.originalURI.host)) {
            // Don't trace the Zipkin UI if we don't specifically request it.
            if (channel.originalURI.prePath == Options.zipkin_site &&
              !Options.trace_zipkin_ui) {
              return;
            }
            // Don't trace the request if we initiated it!
            // Otherwise we could create a loop.
            try {
              if (channel.getRequestHeader('X-Zipkin-Extension')) {
                return;
              }
            } catch(e) {}

            // Tell the request to use a known trace ID so we can get the data back later.
            // Because the ID space is so large it's extremely unlikely that we'll have a conflict.
            var traceID = generateZipkinTraceId();
            console.log("Generating new trace ID: " + traceID + " for host: " + channel.originalURI.host + " (original URL: " + channel.URI.spec + ")");
            // Flags=1 says "debug this request"
            channel.setRequestHeader("X-B3-Flags", "1", false);
            channel.setRequestHeader("X-B3-Sampled", "1", false);
            // The trace ID will only stick if TraceId == SpanId.
            channel.setRequestHeader("X-B3-TraceId", traceID, false);
            channel.setRequestHeader("X-B3-SpanId", traceID, false);
            console.log("Request is pending: " + channel.isPending() + " with status: " + channel.status);

            // Get the HTTP Referer (sic) as an indication of
            // what tab initiated the request. Sometimes this
            // is ineffective, for example loading images from
            // CSS. However I haven't found a way to get the
            // current tab URL directly (and that wouldn't be
            // accurate either, since requests can be issued
            // from background tabs).
            var referer = '';
            try { referer = channel.getRequestHeader('Referer'); } catch(e) {}

            // Record the trace information
            Traces.add(traceID, channel.URI.spec, referer);
          }
          else {
            //log("Host didn't match RegExp: " + channel.originalURI.host + "; " + Options.profile_site);
          }
        }
        catch(e) {
          var stack = '';
          if (typeof e.stack == 'string') {
            stack = "\n" + e.stack;
          }
          log("An error occurred while attempting to set HTTP headers: " + e + stack);
        }
      }
    }
  };

  observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
  observerService.addObserver(myObserver, "http-on-modify-request", false);
}
