import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { Button } from "reactstrap";

interface PillsSelectionProps extends WithTranslation {
  options: string[];
  selected: string[];
  onClick?: (tag: string) => any;
  color: "primary" | "secondary" | "info" | "dark";
}

class PillsSelection extends React.Component<PillsSelectionProps> {
  static defaultProps = { color: "primary" };

  render() {
    const { options, selected, color, t, i18n } = this.props;
    return options.map((tag) => (
      <Button
        size="sm"
        outline={!selected.includes(tag)}
        color={color}
        className="rounded-pill mr-1 mb-1"
        key={tag}
        onClick={(e: any) => this.onClick(e, tag)}
      >
        {i18n.exists(`tags.${tag}`) ? t(`tags.${tag}`) : tag}
      </Button>
    ));
  }

  private onClick(e: Event, tag: string) {
    const { onClick } = this.props;
    const target = e.target as HTMLElement;
    target.classList.remove("hasactive");
    target.blur();
    return onClick && onClick(tag);
  }
}

export default withTranslation()(PillsSelection);
