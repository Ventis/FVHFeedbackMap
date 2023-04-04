import React from "react";
import { loginUrl, registerUrl, passwordResetUrl } from "urls";
import LoginForm from "util_components/account/LoginForm";
import RegisterForm from "util_components/account/RegisterForm";
import Terms from "components/Terms";
import { WithTranslation, withTranslation } from "react-i18next";

type func = () => any;

interface LoginScreenProps extends WithTranslation {
  onLogin: func;
}

type LoginScreenState = {
  mode: "login" | "register";
  showTerms: boolean;
};

class LoginScreen extends React.Component<LoginScreenProps, LoginScreenState> {
  state: LoginScreenState = {
    mode: "login",
    showTerms: false,
  };

  render() {
    const { onLogin, t } = this.props;
    const { mode, showTerms } = this.state;

    return (
      <div className="container">
        <div className="text-center">
          <img
            className="w-50"
            src="images/FORUM_VIRIUM_logo_orange.png"
            alt="logo"
          />
          <h3>{t("FVH Feedback Map")}</h3>
          <p className="lead">
            {mode == "login" ? (
              <>
                <span className="text-primary">{t("Sign in")}</span> {t("or")}{" "}
                <button
                  className="btn btn-outline-primary"
                  onClick={() => this.setState({ mode: "register" })}
                >
                  {t("Register")}
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => this.setState({ mode: "login" })}
                >
                  {t("Sign in")}
                </button>{" "}
                {t("or")} <span className="text-primary">{t("Register")}</span>
              </>
            )}
          </p>
        </div>
        {mode == "login" ? (
          <LoginForm
            loginUrl={loginUrl}
            onLogin={onLogin}
            passwordResetUrl={passwordResetUrl}
          />
        ) : (
          <RegisterForm
            url={registerUrl}
            loginUrl={loginUrl}
            onLogin={onLogin}
          />
        )}
        <Terms />
      </div>
    );
  }
}

export default withTranslation()(LoginScreen);
