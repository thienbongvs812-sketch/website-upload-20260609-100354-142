(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var frame = document.querySelector("[data-player]");
        var video = document.getElementById("movie-player");
        var startButton = document.querySelector("[data-player-start]");
        var status = document.querySelector("[data-player-status]");
        if (!frame || !video || !startButton) {
            return;
        }

        var source = video.getAttribute("data-src");
        var initialized = false;
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message || "";
            }
        }

        function loadScript(url, callback, errorCallback) {
            var script = document.createElement("script");
            script.src = url;
            script.async = true;
            script.onload = callback;
            script.onerror = errorCallback;
            document.head.appendChild(script);
        }

        function attachHls() {
            if (!source) {
                setStatus("当前影片暂无可用播放源");
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                initialized = true;
                setStatus("播放源已就绪");
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("播放源已就绪");
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("播放源加载失败，请稍后再试");
                    }
                });
                initialized = true;
                return;
            }
            loadScript(
                "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js",
                attachHls,
                function () {
                    setStatus("播放组件加载失败，请稍后再试");
                }
            );
        }

        startButton.addEventListener("click", function () {
            startButton.classList.add("is-hidden");
            if (!initialized) {
                setStatus("正在加载播放源");
                attachHls();
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    setStatus("点击视频控制栏即可继续播放");
                    startButton.classList.remove("is-hidden");
                });
            }
        });

        video.addEventListener("play", function () {
            startButton.classList.add("is-hidden");
            setStatus("");
        });

        video.addEventListener("pause", function () {
            if (!video.ended) {
                startButton.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
