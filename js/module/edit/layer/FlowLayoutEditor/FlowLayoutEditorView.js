function FlowLayoutEditorView( model ){

    AbstractEditorView.call ( this, model );

    this.prepareView = function ( panel ) {
        
        var inner = new BitPanel();
            inner.setBackground("#444");
            inner.setSize(280,325);
            
        panel.setLayout( new FlowLayout(5,5) );
        panel.add( inner );
        panel.setBackground("#D9D9D9");
        panel.setAttribute("padding","10px");

        return panel;
    };
}