import React from 'react';
import PropTypes from 'prop-types';
import {
  FacebookShareButton,
  GooglePlusShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  RedditShareButton,
  EmailShareButton,
  TumblrShareButton,
  LivejournalShareButton,
  MailruShareButton,
  ViberShareButton,
  FacebookIcon,
  TwitterIcon,
  GooglePlusIcon,
  LinkedinIcon,
  TelegramIcon,
  WhatsappIcon,
  RedditIcon,
  TumblrIcon,
  MailruIcon,
  EmailIcon,
  LivejournalIcon,
  ViberIcon,
} from 'react-share';

const style = {
  display: 'inline-block',
  marginRight: '0.5em',
};

function SnsShare(props) {
  const { title, shareUrl } = props;
  return (
    <div>
      <div style={style}>
        <FacebookShareButton url={shareUrl} quote={title}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>
      <div style={style}>
        <TwitterShareButton url={shareUrl} title={title}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>
      </div>
      <div style={style}>
        <TelegramShareButton url={shareUrl} title={title}>
          <TelegramIcon size={32} round />
        </TelegramShareButton>
      </div>
      <div style={style}>
        <WhatsappShareButton url={shareUrl} title={title} separator=":: ">
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </div>
      <div style={style}>
        <GooglePlusShareButton url={shareUrl}>
          <GooglePlusIcon size={32} round />
        </GooglePlusShareButton>
      </div>
      <div style={style}>
        <LinkedinShareButton url={shareUrl} title={title} windowWidth={750} windowHeight={600}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
      </div>
      <div style={style}>
        <RedditShareButton url={shareUrl} title={title} windowWidth={660} windowHeight={460}>
          <RedditIcon size={32} round />
        </RedditShareButton>
      </div>
      <div style={style}>
        <TumblrShareButton url={shareUrl} title={title} windowWidth={660} windowHeight={460}>
          <TumblrIcon size={32} round />
        </TumblrShareButton>
      </div>
      <div style={style}>
        <LivejournalShareButton url={shareUrl} title={title} description={shareUrl}>
          <LivejournalIcon size={32} round />
        </LivejournalShareButton>
      </div>
      <div style={style}>
        <MailruShareButton url={shareUrl} title={title}>
          <MailruIcon size={32} round />
        </MailruShareButton>
      </div>
      <div style={style}>
        <EmailShareButton url={shareUrl} subject={title} body={shareUrl}>
          <EmailIcon size={32} round />
        </EmailShareButton>
      </div>
      <div style={style}>
        <ViberShareButton url={shareUrl} title={title} body={shareUrl}>
          <ViberIcon size={32} round />
        </ViberShareButton>
      </div>
    </div>
  );
}

SnsShare.propTypes = {
  shareUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default SnsShare;
