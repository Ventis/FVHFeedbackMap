import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";

class CenteredSpinner extends React.Component<WithTranslation> {
  render() {
    return <div className="text-center p-3">
      <div className="spinner-border text-secondary" role="status">
        <span className="sr-only">`${this.props.t("Loading")}...`</span>
      </div>
    </div>;
  }
}

export default withTranslation()(CenteredSpinner);