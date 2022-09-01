var LayoutEditorFactory = (function(){
    /**
     * erstellt die aktuelle Ebenen Editor View
     * @access public
     * @param  <String> type welcher Typ [border, flow oder grid]
     * @return <AbstractLayoutEditor> editor
     */
    return {
        createLayoutEditor:function( layer ){
            var editor = null;

            var node = Tree.getInstanz().getNode( layer );

            switch (node.getLayout() ) {
                case 'borderlayout':
                        editor = new BorderLayoutEditorView( new BorderLayoutEditor( node ) );
                    break;
                case 'gridlayout':
                        editor = new GridLayoutEditorView( new GridLayoutEditor( node) );
                    break;
                case 'flowlayout':
                        editor = new FlowLayoutEditorView( new FlowLayoutEditor(node) );
            }
                
            return editor;
        }        
    }
})();