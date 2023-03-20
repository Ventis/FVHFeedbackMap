import React from 'react';
import Form from "react-jsonschema-form";
import {JSONSchema6} from "json-schema";
// @ts-ignore
import {Button} from 'reactstrap';
import sessionRequest, {login} from "sessionRequest";
import ErrorAlert from "util_components/bootstrap/ErrorAlert";
import { withTranslation, WithTranslation } from 'react-i18next';
import i18next from 'i18next';

interface RegisterFormProps extends WithTranslation {
  url: string,
  loginUrl: string,
  onLogin: () => any
}

type RegisterFormState = {
  errors?: any,
  loginError: boolean,
  formData?: any
}

const initialState: RegisterFormState = {
  loginError: false
};

const schema: () => JSONSchema6 = () => ({
  type: 'object',
  properties: {
    username: {type: 'string', title: `${i18next.t('Username')}`, default: ''},
    email: {type: 'string', title: `${i18next.t('Email')}`, default: ''},
    password1: {type: 'string', title: `${i18next.t('Password')}`, default: ''},
    password2: {type: 'string', title: `${i18next.t('Repeat password')}`, default: ''},
  },
  required: ['username', 'email', 'password1', 'password2']
});

const uiSchema = {
  password1: {'ui:widget': 'password'},
  password2: {'ui:widget': 'password'}
};

class RegisterForm extends React.Component<RegisterFormProps, RegisterFormState> {
  schema = schema();
  state = initialState;

  render() {
    const {formData, errors} = this.state;
    const {t} = this.props;
    return <Form schema={this.schema} uiSchema={uiSchema} onSubmit={this.onSubmit}
                 // @ts-ignore
                 formData={formData} showErrorList={false} extraErrors={this.extraErrors()}>
      {errors && errors.non_field_errors &&
        <ErrorAlert message={errors.non_field_errors} status/>
      }
      <Button color="primary" type="submit">{t('Register')}</Button>
    </Form>;
  }

  extraErrors = () => {
    return Object.fromEntries(
      Object.entries(this.state.errors || {})
      .map(([field, error]) => [field, {__errors: error}]));
  };

  onSubmit = (data: any) => {
    const {url, loginUrl, onLogin} = this.props;
    sessionRequest(url, {method: 'POST', data: data.formData})
    .then(response => response.json().then(responseData => {
      if (response.status >= 400) this.setState({errors: responseData, formData: data.formData});
      else {
        const credentials = {username: data.formData.username, password: data.formData.password1};
        sessionRequest(loginUrl, {method: 'POST', data: credentials}).then((response) => {
          if (response.status >= 400) this.setState({loginError: true});
          else response.json().then((data) => {
            login(data.key);
            onLogin()
          });
        })
      }
    }))
  }
}

export default withTranslation()(RegisterForm);