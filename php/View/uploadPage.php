<html>
    <head>
    </head>
    <body>
        <div id="bitedit_upload_import_status">
            <?php echo $this->vars['statusCode']."#".$this->vars['filePath']; ?>
        </div>
        <form method="post" action="<?php echo $this->vars['formAddress']; ?>" enctype="multipart/form-data">
            <input type="hidden" name="import_file" value="true" />
        </form>
    </body>
</html>