import CodeMirror from 'codemirror';

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

/* eslint-disable */
(function(mod) {
  mod(CodeMirror);
}(function(CodeMirror) {
  CodeMirror.defineOption("placeholder", "", function(cm, val, old) {
    const prev = old && old != CodeMirror.Init;
    if (val && !prev) {
      cm.on("blur", onBlur);
      cm.on("change", onChange);
      cm.on("focus", onFocus);
      cm.on("swapDoc", onChange);
      onChange(cm);
    } else if (!val && prev) {
      cm.off("blur", onBlur);
      cm.off("change", onChange);
      cm.off("swapDoc", onChange);
      clearPlaceholder(cm);
      const wrapper = cm.getWrapperElement();
      wrapper.className = wrapper.className.replace(" CodeMirror-empty", "");
    }

    if (val && !cm.hasFocus()) onBlur(cm);
  });

  function clearPlaceholder(cm) {
    if (cm.state.placeholder) {
      cm.state.placeholder.parentNode.removeChild(cm.state.placeholder);
      cm.state.placeholder = null;
    }
  }
  function setPlaceholder(cm) {
    clearPlaceholder(cm);
    const elt = cm.state.placeholder = document.createElement("pre");
    elt.style.cssText = "height: 0; overflow: visible";
    elt.style.direction = cm.getOption("direction");
    elt.className = "CodeMirror-placeholder";
    var placeHolder = cm.getOption("placeholder")
    if (typeof placeHolder == "string") placeHolder = document.createTextNode(placeHolder)
    elt.appendChild(placeHolder)
    cm.display.lineSpace.insertBefore(elt, cm.display.lineSpace.firstChild);
  }

  function onBlur(cm) {
    if (isEmpty(cm)) setPlaceholder(cm);
  }

  function onFocus(cm) {
    clearPlaceholder(cm);
  }

  function onChange(cm) {
    const wrapper = cm.getWrapperElement(), empty = isEmpty(cm);
    wrapper.className = wrapper.className.replace(" CodeMirror-empty", "") + (empty ? " CodeMirror-empty" : "");
  }

  function isEmpty(cm) {
    return (cm.lineCount() === 1) && (cm.getLine(0) === "");
  }
}));
/* eslint-enable */