import React, { Component } from 'react';
import $ from 'jquery';
import moment from 'moment';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
});

class Clock extends Component {
  componentDidMount() {
    let currentLang = 'en';
    const snippets = [];
    const createSnippets = () => {
      let i;
      moment.locale(currentLang);
      for (i = 0; i < snippets.length; i++) {
        snippets[i].render();
      }
    };

    const updateSnippets = () => {
      let i;

      moment.locale(currentLang);

      for (i = 0; i < snippets.length; i++) {
        snippets[i].update();
      }
    };

    const updateClock = () => {
      const now = moment();
      const second = now.seconds() * 6;
      const minute = now.minutes() * 6 + second / 60;
      const hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12;

      $('#hour').css('transform', `rotate(${hour}deg)`);
      $('#minute').css('transform', `rotate(${minute}deg)`);
      $('#second').css('transform', `rotate(${second}deg)`);
    };

    const spaces = (length) => {
      let out = '';
      while (out.length < length) {
        out += ' ';
      }
      return out;
    };

    const Snippet = (el) => {
      let longest = 0;
      let i;
      const text = this.text = el.text().split('\n');
      const html = this.html = el.html().split('\n');
      const evals = this.evals = [];
      this.el = el;
      for (i = 0; i < text.length; i++) {
        longest = Math.max(text[i].length, longest);
        evals[i] = new Function(`return ${text[i]}`);
      }
      for (i = 0; i < text.length; i++) {
        html[i] += spaces(longest - text[i].length);
      }
    };

    Snippet.prototype.render = () => {
      const output = [];
      let i;
      for (i = 0; i < this.html.length; i++) {
        output[i] = this.html[i];
        output[i] += '<span class="comment"> // ';
        output[i] += this.evals[i]();
        output[i] += '</span>';
      }

      this.el.html(output.join('\n'));
    };

    Snippet.prototype.update = () => {
      let i;
      const comments = [];

      if (!this.comments) {
        for (i = 0; i < this.el[0].childNodes.length; i++) {
          if (this.el[0].childNodes[i].className === 'comment') {
            comments.push($(this.el[0].childNodes[i]));
          }
        }
        this.comments = comments;
      }

      for (i = 0; i < this.comments.length; i++) {
        this.comments[i].text(` // ${this.evals[i]()}`);
      }
    };

    const timedUpdate = () => {
      updateClock();
      updateSnippets();
      setTimeout(timedUpdate, 1000);
    };

    $('.page-moment-index code').each(() => {
      snippets.push(new Snippet($(this)));
    });

    createSnippets();
    timedUpdate();

    $(document).on('click', '[data-locale]', ()=> {
      const dom = $(this);
      currentLang = dom.data('locale');
      $('[data-locale]').removeClass('active');
      dom.addClass('active');
      updateSnippets();
    });
  }

  render() {
    return (
      <div>
        <Typography gutterBottom type="subheading">
                現在時刻
        </Typography>
        <div className="hero-circle">
          <div className="hero-face">
            <div id="hour" className="hero-hour" />
            <div id="minute" className="hero-minute" />
            <div id="second" className="hero-second" />
          </div>
        </div>
        <Typography type="display2" align="center">16:20</Typography>
      </div>
    );
  }
}

export default withStyles(styles)(Clock);
