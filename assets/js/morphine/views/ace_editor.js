
Morphine.AceEditor = Em.View.extend({
  tagName: 'div',
  classNames: ['ace-editor'],

  /**
    Editor content
    @property
    @type String
  */
  value: '',

  /**
    True if the editor should be able to be vertically resized
    @property
    @type boolean
  */
  resizable: true,

  /**
    Programming language of the editor
    @property
    @type String
  */
  language: 'javascript',

  /**
    The Ace editor object
    @property
    @type Object
  */
  editor: null,

  didInsertElement: function(){
    // Create element to put editor in
    var id = this.get('elementId') +'-editor',
        editorEl = document.createElement('div'),
        editor;

    this.$().append(editorEl);

    editorEl.id = id;
    editor = ace.edit(id);
    editor.setTheme("ace/theme/eclipse");

    // Value
    editor.setValue(this.get('value'));
    editor.getSession().on('change', function(e) {
        this.set('value', editor.getValue());
    });
    editor.gotoLine(1);

    this.set('editor', editor);
    this.setLanguage();

    // Resizing
    this.setupResizer();
    $(document).mousemove($.proxy(this.resizeHandler, this));
  },

  /**
    Setup this editor to be resizable

    @method
  */
  setupResizer: function(){
    // Resizing disabled
    if (!this.get('resizable') === true){
      this.set('isResizing', false);
    }
  }.observes('resizable'),

  /**
    Update the value of the editor
  */
  updateValue: function(){
    var val = this.get('value'),
        editor = this.get('editor');

    if (val != editor.getValue()) {
      editor.setValue(val);
    }
  }.observes('value'),

  /**
    Set the programming language for the editor
  */
  setLanguage: function(){
    var lang = this.get('language'),
        editor = this.get('editor').getSession();

    editor.setMode('ace/mode/%@'.fmt(lang));
  }.observes('language'),

  /**
    Set the resize cursor
  */
  mouseMove: function(evt){
    var el = this.$(),
        offset = el.offset(),
        height = el.height();
    offset.bottom = offset.top + height;

    // Already resizing
    if (this.get('isResizing')) {
      return;
    }

    // Within 5 pixels of the bottom
    if ( offset.bottom - evt.pageY < 5){
      this.set('canResize', true);
      el.css('cursor', 'row-resize');
    }
    else {
      this.set('canResize', false);
      el.css('cursor', '');
    }
  },

  /**
    Mouse down on the editor container
  */
  mouseDown: function(evt){

    if (this.get('resizable') && this.get('canResize')) {

      // Ignore anything by the left click
      if (evt.which != 1 || evt.ctrlKey === true) {
        return;
      }

      this.set('resizeStart', evt.pageY);
      this.set('isResizing', true);
    }
    else {
      this.set('isResizing', false);
    }
  },

  /**
    Mouse up on the editor container
  */
  mouseUp: function(evt) {
    this.set('isResizing', false);
  },

  /**
    Handle resizing as the cursor is draging
  */
  resizeHandler: function(evt){
    var el = this.$(),
        doc = $(document),
        pageY = evt.pageY,
        el, height, startY, moved, editor;

    // Resizing
    if (this.get('isResizing')) {
      startY = this.get('resizeStart');
      moved = pageY - startY;
      height = el.height() + moved;

      // Minimum height
      if (height < 10){
        height = 10;
      }

      // Height
      el.height(height);

      // TODO: Always keep a buffer at the bottom of the window

      this.get('editor').resize();
      this.set('resizeStart', pageY);
    }
  }
});