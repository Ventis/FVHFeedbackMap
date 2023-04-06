import React from "react";
import CenteredSpinner from "util_components/bootstrap/CenteredSpinner";
import { withTranslation, WithTranslation } from "react-i18next";

class LoadScreen extends React.Component<WithTranslation> {
  render() {
    const { t } = this.props;
    return (
      <div className="container">
        <div className="jumbotron mt-5 bg-light shadow text-center">
          <img
            className="w-50"
            src="images/FORUM_VIRIUM_logo_orange.png"
            alt="Logo FORUM VIRIUM"
          />
          <h3>{t("FVH Feedback Map")}</h3>
          <p className="lead text-primary mt-3">
            {t(
              "To confidently go where many a delivery man has gotten lost before."
            )}
          </p>
          <CenteredSpinner />
        </div>
      </div>
    );
  }
}

export default withTranslation()(LoadScreen);
