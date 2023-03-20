import React, {FormEvent} from 'react';
import { useTranslation, withTranslation, WithTranslation } from 'react-i18next';
import sessionRequest, {login, logout} from "sessionRequest";
import ErrorAlert from "util_components/bootstrap/ErrorAlert";

interface Props extends WithTranslation {
  changePasswordUrl: string,
  token: string,
  uid: string
};

type State = {
  new_password1: string,
  new_password2: string,
  error: any,
  success: boolean
};

const initialState: State = {
  new_password1: '',
  new_password2: '',
  error: '',
  success: false
};

class ResetPasswordForm extends React.Component<Props, State> {
  state = initialState;

  render() {
    const {success} = this.state;
    const {t} = this.props;

    return success ?
      <p>{t("Password successfully reset.")} <a href='#/'>{t("Go to login")}</a></p>
    :
      <form onSubmit={this.submit}>
        <ErrorAlert status={Boolean(this.state.error)} message={this.state.error}/>
        <div className="form-group">
          <label htmlFor="password">{t("Password")}</label>
          <input type="password" className="form-control" name="new_password1" id="new_password1"
                 defaultValue={this.state.new_password1}/>
        </div>
        <div className="form-group">
          <label htmlFor="password">{t("Repeat password")}</label>
          <input type="password" className="form-control" name="new_password2" id="new_password2"
                 defaultValue={this.state.new_password2}/>
        </div>
        <button type="submit" className="btn btn-primary">{t("Submit")}</button>
      </form>;
  }

  focusPassword() {
    const input = document.getElementById('password');
    if (input) input.focus();
  }

  submit = (e: any) => {
    const {changePasswordUrl, uid, token, } = this.props;
    const {t} = useTranslation();
    e.preventDefault();
    const formData = new FormData(e.target);
    let data = {};
    // @ts-ignore
    formData.forEach((value: any, key: string) => data[key] = value);
    this.setState({error: false, ...data});
    logout();
    sessionRequest(changePasswordUrl, {method: 'POST', data: {...data, uid, token}}).then((response) => {
      if (response.status == 200) this.setState({success: true});
      else if (response.status == 400) response.json().then(resp => {
        if (resp.token) this.setState({error:
            <>{t('Invalid token. You may need to request a new reset from the')} <a href='/#/'>{t('login screen')}</a>.</>
        });
        const field_error = resp.new_password1 || resp.new_password2;
        if (field_error) this.setState({error: field_error});
      });
      else this.setState({error: t("Reset failed. Please try again.")});
    })
  };
}

export default withTranslation()(ResetPasswordForm);
