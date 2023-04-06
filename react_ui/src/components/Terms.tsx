import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import Modal from "util_components/bootstrap/Modal";

interface TermsProps extends WithTranslation {}

type TermsState = { showTerms: any };

const initialState: TermsState = { showTerms: false };

class Terms extends React.Component<TermsProps, TermsState> {
  state = initialState;

  render() {
    const { showTerms } = this.state;
    const { t } = this.props;
    return (
      <>
        <p>
          {t("By using this website, you agree to our")}{" "}
          <a
            onClick={() => this.setState({ showTerms: "terms" })}
            className="clickable text-primary"
          >
            {t("Usage terms & privacy policy")}
          </a>
          ,{" "}
          {t(
            "and that any map notes and images published here are placed in the public domain under the"
          )}{" "}
          <a
            onClick={() => this.setState({ showTerms: "cc0" })}
            className="clickable text-primary"
          >
            {t("CC0 License")}
          </a>
          .
        </p>
        {showTerms && (
          <Modal onClose={() => this.setState({ showTerms: false })} title="">
            <iframe
              style={{
                height: "calc(100vh - 270px)",
                width: "100%",
                border: "none",
              }}
              className="mt-2"
              src={`/${showTerms}.html`}
            />
            <div className="p-2">
              <button
                className="btn btn-outline-primary btn-block"
                onClick={() => this.setState({ showTerms: false })}
              >
                {t("Close")}
              </button>
            </div>
          </Modal>
        )}
      </>
    );
  }
}

export default withTranslation()(Terms);
