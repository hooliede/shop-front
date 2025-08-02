import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

export const loginWithEmail = createAsyncThunk(
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      // 성공했을 때
      // login페이지에서 처리?...
      return response.data;
    } catch (error) {
      // 실패했을 때 -> reduce에 에러 저장
      return rejectWithValue(error.error);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {}
);

export const logout = () => (dispatch) => {};
export const registerUser = createAsyncThunk(
  // 비동기 처리
  "user/registerUser", // Redux 내부에서 액션을 식별할 때 쓰는 고유 문자열 ID로  Redux에서 "이건 userSlice의 registerUser 액션이다"라는 걸 나타내는 식별자
  async (
    { email, name, password, navigate }, // 첫 번째 인자 -> 우리가 넘겨준 payload (회원가입 데이터)
    { dispatch, rejectWithValue } // 두 번째 인자 → Redux Toolkit의 ThunkAPI (dispatch, rejectWithValue 등)  상태 관리와 에러 처리를 위한 함수
  ) => {
    try {
      const response = await api.post("/user", { email, name, password });
      // 성공했을 때
      // 1.성공 토스트 메세지 보여주기
      dispatch(
        showToastMessage({ message: "회원가입 성공!", status: "success" })
      );
      // 2.로그인 페이지로 리다이렉트
      navigate("/login");
      return response.data.data; // axios는 기본적으로 response.data에 데이터를 넣고 + backend에서도 data에 데이터를 넣었으니 data.data
    } catch (error) {
      // 실패했을 때
      // 1.실패 토스트 메세지 보여주기
      dispatch(
        showToastMessage({ message: "회원가입 실패!", status: "error" })
      );
      // 2.에러값 저장하기
      return rejectWithValue(error.error);
    }
  }
);
// dispatch의 역할
// 두 번째 인자에 dispatch가 있는 이유는 이 Thunk 함수 안에서 여러 액션을 연속 실행할 수 있도록 하기 위해서
// 회원가입 → 다른 상태 초기화 → 토스트 메시지 → 페이지 이동 등 여러 작업을 한 번에 처리할 때를 위해서 dispatch가 필요
// rejectWithValue의 역할
// createAsyncThunk에서 실패했을 때 에러를 전달하는 전용 함수

export const loginWithToken = createAsyncThunk(
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {}
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
  },
  extraReducers: (builder) => {
    // extrareducers은 외부에서 발생한 액션, 특히 비동기 액션을 처리하는 전용 영역, 서버 통신 후 Redux Store에 결과를 저장하는 역할
    builder
      .addCase(registerUser.pending, (state) => {
        // 서버와의 통신을 기다릴 때
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        // 서버와의 통신이 성공일 때
        state.loading = false;
        state.registrationError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        // 서버와의 통신이 실패일 때
        state.registrationError = action.payload;
      })
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;        
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.loginError = null;
        sessionStorage.setItem("token", action.payload.token);
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      });
  },
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
