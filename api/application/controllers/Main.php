<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Main extends CI_Controller
{

    /**
     * Index Page for this controller.
     *
     * Maps to the following URL
     *      http://example.com/index.php/welcome
     *  - or -
     *      http://example.com/index.php/welcome/index
     *  - or -
     * Since this controller is set as the default controller in
     * config/routes.php, it's displayed at http://example.com/
     *
     * So any other public methods not prefixed with an underscore will
     * map to /index.php/welcome/<method_name>
     * @see https://codeigniter.com/user_guide/general/urls.html
     */
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Main_model');
        $this->load->database();
    }
    public function getInfo() {
        $un = $this->input->post("un");
        $pw = $this->input->post("pw");
        $t = json_encode($this->Main_model->main($un,$pw));
        header("Access-Control-Allow-Origin: *");
        echo $t;
    }
    public function post() {
        $uid = $this->input->post("uid");
        $name = $this->input->post("name");
        $email = $this->input->post("email");
        $text1 = $this->input->post("text1");
        $text2 = $this->input->post("text2");
        header("Access-Control-Allow-Origin: *");
        echo json_encode($this->Main_model->post($uid, $name, $email, $text1, $text2));
    }
}
