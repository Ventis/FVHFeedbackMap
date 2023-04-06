import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import IFrameModal from "util_components/IFrameModal";

interface SearchModalProps extends WithTranslation {
  searchUrl: (term: string) => string;
  placeholder?: string;
}

type SearchModalState = {
  searchTerm?: string;
};

const initialState: SearchModalState = {};

class SearchModal extends React.Component<SearchModalProps, SearchModalState> {
  state = initialState;

  render() {
    const { placeholder, searchUrl, t } = this.props;
    const { searchTerm } = this.state;
    return (
      <>
        <input
          className="form-control rounded-pill"
          type="text"
          placeholder={placeholder || t("Search")}
          onBlur={this.onSearch}
          onKeyPress={(e) => e.key == "Enter" && this.onSearch(e)}
        />
        {searchTerm && (
          <IFrameModal
            url={searchUrl(searchTerm)}
            title={t("Search") + `: ${searchTerm}`}
            onClose={() => this.setState({ searchTerm: undefined })}
          />
        )}
      </>
    );
  }

  onSearch = (e: any) => {
    this.setState({ searchTerm: e.target.value });
  };
}

export default withTranslation()(SearchModal);
