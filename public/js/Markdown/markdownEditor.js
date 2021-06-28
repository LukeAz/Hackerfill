'use strict'
var editor = editormd("editor", {
  height  : 640,
  path : "/js/Markdown/lib/",
  theme: "dark",
  previewTheme: "dark",
  editorTheme: "pastel-on-dark",
  toolbarIcons : function() { return ["undo", "redo", "|", "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|", "h1", "h2", "h3", "|", "list-ul", "list-ol", "hr", "|", "link", "image", "code", "preformatted-text", "code-block", "table", "|", "watch", "preview", "clear", "search"]},
  lang: {
    name : "en",
    description : "Open source online Markdown editor.",
    tocTitle    : "Table of Contents",
    toolbar : {
      undo             : "Undo(Ctrl+Z)",
      redo             : "Redo(Ctrl+Y)",
      bold             : "Bold",
      del              : "Strikethrough",
      italic           : "Italic",
      quote            : "Block quote",
      ucwords          : "Words first letter convert to uppercase",
      uppercase        : "Selection text convert to uppercase",
      lowercase        : "Selection text convert to lowercase",
      h1               : "Heading 1",
      h2               : "Heading 2",
      h3               : "Heading 3",
      h4               : "Heading 4",
      h5               : "Heading 5",
      h6               : "Heading 6",
      "list-ul"        : "Unordered list",
      "list-ol"        : "Ordered list",
      hr               : "Horizontal rule",
      link             : "Link",
      image            : "Image",
      code             : "Code inline",
      "preformatted-text" : "Preformatted text / Code block (Tab indent)",
      "code-block"     : "Code block (Multi-languages)",
      table            : "Tables",
      watch            : "Unwatch",
      unwatch          : "Watch",
      preview          : "HTML Preview (Press Shift + ESC exit)",
      clear            : "Clear",
      search           : "Search",
    },
    buttons : {
      enter  : "Enter",
      cancel : "Cancel",
      close  : "Close"
    },
    dialog : {
      link : {
        title    : "Link",
        url      : "Address",
        urlTitle : "Title",
        urlEmpty : "Error: Please fill in the link address."
      },
      image : {
        title    : "Image",
        url      : "Address",
        link     : "Link",
        alt      : "Title",
        uploadButton     : "Upload",
        imageURLEmpty    : "Error: picture url address can't be empty.",
        uploadFileEmpty  : "Error: upload pictures cannot be empty!",
        formatNotAllowed : "Error: only allows to upload pictures file, upload allowed image file format:"
      },
      preformattedText : {
        title             : "Preformatted text / Codes", 
        emptyAlert        : "Error: Please fill in the Preformatted text or content of the codes.",
        placeholder       : "coding now...."
      },
      codeBlock : {
        title             : "Code block",         
        selectLabel       : "Languages: ",
        selectDefaultText : "select a code language...",
        otherLanguage     : "Other languages",
        unselectedLanguageAlert : "Error: Please select the code language.",
        codeEmptyAlert    : "Error: Please fill in the code content.",
        placeholder       : "coding now...."
      }
    }
  }
});
