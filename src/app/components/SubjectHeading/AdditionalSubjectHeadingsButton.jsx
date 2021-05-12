import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

class AdditionalSubjectHeadingsButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.updateParent(this);
  }

  render() {
    const {
      indentation,
      text,
      linkUrl,
      noEllipse,
      marginSize,
    } = this.props;

    const previous = this.props.button === 'previous';

    const seeMoreText = text || 'See more';

    let button;

    if (linkUrl) {
      button = (
        <Link
          to={linkUrl}
          className="seeMoreButton toIndex"
        >
          {seeMoreText}
        </Link>
      );
    } else if (this.props.button === 'contextMore') {
      button = (
        <span
          data={`${text}-${linkUrl}`}
          className="contextMore"
        >
          {seeMoreText}
        </span>
      );
    } else {
      button = (
        <button
          data={`${text}-${linkUrl}`}
          onClick={this.onClick}
          className="seeMoreButton"
        >
          {previous ? '↑' : '↓'} <em key="seeMoreText">{seeMoreText}</em>
          {previous ? null : <br /> }
          {previous || noEllipse ? null : <VerticalEllipse />}
        </button>
      );
    }

    if (previous && linkUrl) return null;

    const content = button;

    if (!content) return null;

    return (
      <tr
        className={`subjectHeadingRow seeMore ${previous || noEllipse ? '' : 'ellipse'}`}
      >
        <td className="subjectHeadingsTableCell" colSpan="4">
          <div className="subjectHeadingLabelInner" style={{ marginLeft: `${marginSize * indentation}px` }}>
            {
              content
            }
          </div>
        </td>
      </tr>
    );
  }
}

const VerticalEllipse = () => (
  <div className="verticalEllipse">
    <div className="dot">.</div>
    <div className="dot">.</div>
    <div className="dot">.</div>
  </div>
);

AdditionalSubjectHeadingsButton.propTypes = {
  updateParent: PropTypes.func,
  indentation: PropTypes.number,
  button: PropTypes.string,
  linkUrl: PropTypes.string,
  text: PropTypes.string,
  noEllipse: PropTypes.bool,
  marginSize: PropTypes.number,
};

export default AdditionalSubjectHeadingsButton;
