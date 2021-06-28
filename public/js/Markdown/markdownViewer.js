'use strict'
editormd.defaults.theme = "dark";
editormd.defaults.editorTheme = "dark";
editormd.defaults.previewTheme = "dark";

/**
 * @author LukeAz
 * This editor is supposed to support certain filters for html, but apparently only 3 tags 
 * work (this is also on the online demo (https://pandao.github.io/editor.md/examples/html-tags-decode.html) 
 * they provide, so it's a problem with the editor), so to gloss over the problem I modified the source code
 * by adding a DOMpurify and adding a setting to configure it from here (PURIFY, FORBID_TAGS, FORBID_ATTR).
 * I used this script to solve the problem: https://github.com/cure53/DOMPurify.
 * I have set htmlDecode to true, so that I filter directly from the DOMpurify
 */
var testEditormdView = editormd.markdownToHTML("editormd-view", {
  htmlDecode: true,
  PURIFY: true,
  FORBID_TAGS: ["head", "link", "meta", "style", "script", "iframe", "object", "sub", "sup", "frame", "frameset", "form", "button", "input", "textarea", "html", "body", "canvas", "command", "eventsource"],
  FORBID_ATTR: ["style", "id", "class", "method", "action"],
  emoji: true
});