function moherAddScript(src, options) {
    var context = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.setAttribute('defer', (options.defer === true) ? '' : false);
    context.appendChild(script);
};

moherAddScript("https://lpflow-assets.sfo2.digitaloceanspaces.com/scripts/global.js?" + Date.now(), {defer:true});