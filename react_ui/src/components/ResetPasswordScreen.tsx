import React from 'react';
import Terms from "components/Terms";
import ResetPasswordForm from "util_components/account/ResetPasswordForm";
import {changePasswordUrl} from "urls";
import { withTranslation, WithTranslation } from 'react-i18next';

interface ResetPasswordScreenProps extends WithTranslation {
  uid: string,
  token: string
};

type ResetPasswordScreenState = {
};

class ResetPasswordScreen extends React.Component<ResetPasswordScreenProps, ResetPasswordScreenState> {
  state: ResetPasswordScreenState = {
  };

  render() {
    const {uid, token, t} = this.props;
    return (
      <div className="container">
        <div className="text-center">
          <img className="w-50" src="images/FORUM_VIRIUM_logo_orange.png" alt="logo"/>
          <h3>{t('FVH Feedback Map')}</h3>
          <p className="lead">{t('Reset password')}</p>
        </div>
        <ResetPasswordForm changePasswordUrl={changePasswordUrl} token={token} uid={uid}/>
        <Terms/>
      </div>
    );
  }
}

export default withTranslation()(ResetPasswordScreen);