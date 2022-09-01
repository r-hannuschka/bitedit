<?php
interface BitEdit_Command_Base {
    public function run(Request $req, Response $res);
}
?>