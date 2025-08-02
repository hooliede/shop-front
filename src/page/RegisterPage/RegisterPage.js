import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import "./style/register.style.css";

import { registerUser } from "../../features/user/userSlice";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    policy: false,
  });
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState("");
  const [policyError, setPolicyError] = useState(false);
  const { registrationError } = useSelector((state) => state.user);
  // Redux Store에 전역 상태로 관리되고, 이 값은 서버와의 회원가입 요청 중 실패했을 때 생기는 에러 메시지를 저장

  const register = (event) => { // Form의 onSubmit 이벤트 객체를 받는다
    event.preventDefault();
    const { name, email, password, confirmPassword, policy } = formData;
    const checkConfirmPassword = password === confirmPassword; // password와 confirmPassword가 같은지 비교
    if (!checkConfirmPassword) {
      setPasswordError("비밀번호 중복확인이 일치하지 않습니다.");
      return;
    }
    if (!policy) {
      setPolicyError(true);
      return;
    }
    setPasswordError("");
    setPolicyError(false);
    dispatch(registerUser({ name, email, password, navigate }));
    // Redux의 dispatch()로 registerUser라는 액션을 실행, registerUser는 createAsyncThunk로 만들어진 비동기 함수이며 서버에 회원가입 요청을 보내고 결과를 Redux 상태에 반영하는 역할
    // name, email, password, navigate => registerUser로 보내는 인수
  };

  const handleChange = (event) => {
    event.preventDefault();
    let { id, value, type, checked } = event.target;
    if (id === "confirmPassword" && passwordError) setPasswordError("");
    // 비밀번호 확인란이고, 기존에 에러 메시지가 있을 때: 회원가입 버튼을 눌렀는데 재확인이 틀려서 passwordError가 발생했고 -> 비밀번호 확인 칸을 다시 수정하기 시작했을 때 에러 메시지를 지워라
    if (type === "checkbox") {
      if (policyError) setPolicyError(false);
      // 체크박스 에러는 회원가입 버튼을 눌러야(register) 생기고,
      // 그 이후 사용자가 체크박스를 눌렀을 때(handleChange) 해제가 된다
      setFormData((prevState) => ({ ...prevState, [id]: checked }));
      // 둘 다 기존 상태 복사 + 새 값 덮어쓰기. prevState는 React가 최신 상태를 보장하기 위해 콜백으로 전달하는 안전한 패턴.
      // 체크박스나 빠른 연속 업데이트 같은 비동기 상황에서는 prevState를 쓰는 게 안정적
      // 핵심은 체크박스이기 때문에 prevState를 쓰는 경우가 많다는 점, 체크박스는 클릭 한 번으로 값이 true ↔ false로 즉시 토글된다 -> 항상 최신 상태를 보장하기 위해 prevState 패턴을 쓰는 것이 안전한 방식
      // 일반 input(value)도 prevState를 써도 되지만, 순차 입력이라 상태 꼬임 가능성이 적기 때문에 보통 formData를 직접 참조하는 방식을 사용
    } else {   // else인 경우는 이메일 입력/이름 입력/비밀번호 입력/비밀번호 확인(첫 입력, passwordError 아직 없음)
      setFormData({ ...formData, [id]: value });     
    }          // 기존의 formData를 복사 + 입력 받은 값을 키:값 구조로 추가 또는 덮어쓰고 -> 새로운 객체를 만들어 FormData로 저장
  };

  return (
    <Container className="register-area">
      {registrationError && (
        <div>
          <Alert variant="danger" className="error-message">
            {registrationError}
          </Alert>
        </div>
      )}
      {/* {registrationError && (
              <div>에러 메시지</div>
          )}  -> 이게 이제 JSX에서 if문을 간단히 쓴 표현이고 registration 값 즉 서버와의 통신 오류가 있으면 Alert 태그를 렌더링하고, 없으면 안 한다*/} 



      <Form onSubmit={register}> 
        {/* 이메일 입력 영역 */}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            id="email"
            placeholder="Enter email"
            onChange={handleChange}
            required
          />
        </Form.Group>



        {/* 이름 입력 영역 */}
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            id="name"
            placeholder="Enter name"
            onChange={handleChange}
            required
          />
        </Form.Group>



        {/* 비밀번호 입력 영역 */}
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            id="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
        </Form.Group>



        {/* 비밀번호 확인 입력 영역 */}
        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
            isInvalid={passwordError}
          />
          <Form.Control.Feedback type="invalid">
            {passwordError}
          </Form.Control.Feedback>
        </Form.Group>



        {/* 이용약관 확인 영역 */}
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="이용약관에 동의합니다"
            id="policy"
            onChange={handleChange}
            isInvalid={policyError}
            checked={formData.policy}
          />
        </Form.Group>
        <Button variant="danger" type="submit">
          회원가입
        </Button>
      </Form>
    </Container>
  );
};

export default RegisterPage;
