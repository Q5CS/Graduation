<?php

class Main_model extends CI_Model
{
    public $uid;
    public $user;
    public function main($un,$pw) {
        $t = $this->login($un,$pw);
        if($t["status"] == 1) { //succ
            $this->getInfo();
            $this->user["status"] = 1;
            return $this->user;
        } else { //err
            return $t;
        }
    }
    public function post($uid, $name, $email, $text1, $text2) {
        $this->db->where('uid', $uid);
        if($this->db->count_all_results('saytome')) {
            $data = ["status" => -1, "msg" => "你已经填写过啦，不要反悔哦！"];
            return $data;
        }
        $data = [
            "uid" => $uid,
            "name" => $name,
            "email" => $email,
            "text1" => $text1,
            "text2" => $text2
        ];
        $this->db->insert('saytome', $data);
        $data = ["status" => 1, "msg" => "拿小本本记下来了！"];
        return $data;
    }
    private function login($name,$pw) {
        $name = urldecode($name);
        $json_text = '{"head":{"msgType":"login"},"account":"","psw":"","checkSum":"","deviceToken":"123456"}';
        $json = json_decode($json_text);
        $json->account = $name;
        $json->psw = $pw;
        $json->checkSum = substr(strtoupper(md5('login' . $name . $pw)), 8, 32);
        $post_data = json_encode($json, JSON_UNESCAPED_UNICODE);
        $res = $this->Curl_post($post_data);
        if(is_null($res)) {
            $data = ["status" => -3, "msg" => "无法访问五中官网，可能是官网维护，请稍后再试"];
            return $data;
        }
        if($res->result->code != '0') {
            $data = ["status" => -1, "msg" => "登录失败，请检查账号密码是否正确"];
            return $data;
        }
        $this->uid = $res->head->sessionID;
        //获取个人信息
        $json_text = '{"head":{"msgType":"getSchoolInfo","sessionID":""}}';
        $json = json_decode($json_text);
        $json->head->sessionID = $this->uid;
        $post_data = json_encode($json, JSON_UNESCAPED_UNICODE);
        $res = $this->Curl_post($post_data);
        // var_dump($res);
        $this->user["uid"] = $res->items[0]->value;
        $this->user["name"] = $res->items[4]->value;
        $this->user["grade"] = $res->items[25]->value;
        if ($res->items[30]->value == "走读") {
            $this->user["stay"] = false;
        } else {
            $this->user["stay"] = true;
        }
        // echo $user["grade"];
        if($this->user["grade"] != "高中2015级") {
            $data = ["status" => -2, "msg" => "毕业档案只有高三毕业生才能看哦！好好读书吧！"];
            return $data;
        }
        $data = ["status" => 1];
        return $data;
    }
    private function getInfo() {
        //获取成绩
        $json_text = '{"head":{"msgType":"getResultInfo","sessionID":""}}';
        $json = json_decode($json_text);
        $json->head->sessionID = $this->uid;
        $post_data = json_encode($json, JSON_UNESCAPED_UNICODE);
        $res = $this->Curl_post($post_data);
        // var_dump($res);

        $last = 1;
        $this->user["from"] = 0; //进步最大的，从
        $this->user["to"] = 0; //进步最大的，到
        $this->user["maxProgress"] = 0; //进步最大的，几名
        foreach ( $res->items as $t ) {
            $name = $t->name;
            // 如果不是高二或高三的成绩，则跳过本次循环
            if(strpos($name,"高二")===FALSE && strpos($name,"高三")===FALSE) continue;
            $len = count($t->scoreList);
            $rank = intval($t->scoreList[$len-1]);
            if($rank < 1)  continue; //没成绩就跳过
            $progress = intval($last) - intval($rank);
            if($progress >= $this->user["maxProgress"]) {
                $this->user["maxProgress"] = $progress;
                $this->user["from"] = $last;
                $this->user["to"] = $rank;
            }
            $last = $rank; //上次的 = 这次的
            // echo $name . " " . $rank . "\n";
        }
    }
    private function Curl_post($content) {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, 'http://www.qz5z.com//?action=stu');
        curl_setopt($curl, CURLOPT_HEADER, FALSE);
        curl_setopt($curl, CURLOPT_NOBODY, FALSE);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_TIMEOUT, 8);
        $curl_errno = curl_errno($curl);
        //设置post数据
        curl_setopt($curl, CURLOPT_POSTFIELDS, $content);
        //执行命令
        $response = json_decode(curl_exec($curl));
        //关闭URL请求
        curl_close($curl);
        if($curl_errno > 0) {  
            echo "{status: -3, msg: \"无法访问五中官网，请稍候再试\"}";
            die();
        }  
        //显示获得的数据
        return($response);
    }


}
