import { getProgramHomePageContentData } from '../common/fetch.js';
import { Logger } from '../common/logger.js';

const logger = Logger('pages/home');

export async function initHome() {
  logger.info({
    fn: initHome,
    message: `initializing home page`,
  });

  updateHomePageWithContent();
}

async function updateHomePageWithContent() {
  const contentData = await getProgramHomePageContentData();

  logger.info({
    fn: updateHomePageWithContent,
    message: `received program home page content data`,
    data: { contentData },
  });

  const html = generateProgramHtml(contentData);

  logger.info({
    fn: updateHomePageWithContent,
    message: `generated program html content`,
    data: { html },
  });

  injectProgramHtml(html);
}

function injectProgramHtml(htmlString) {
  const container = document.getElementById('programHomePageContent');
  if (container) {
    container.innerHTML = htmlString;
  } else {
    logger.warn({
      fn: injectProgramHtml,
      message: `Element with id "programHomePageContent" not found.`,
    });
  }
}

function generateProgramHtml(contentData) {
  const programs = contentData.data?.value || [];
  const now = new Date();

  // Sort: by most recent open date (if exists), then by most recent close date
  programs.sort((a, b) => {
    const aOpen = a.quartech_programopendate
      ? new Date(a.quartech_programopendate).getTime()
      : 0;
    const bOpen = b.quartech_programopendate
      ? new Date(b.quartech_programopendate).getTime()
      : 0;
    if (bOpen !== aOpen) return bOpen - aOpen;

    const aClose = a.quartech_programclosedate
      ? new Date(a.quartech_programclosedate).getTime()
      : 0;
    const bClose = b.quartech_programclosedate
      ? new Date(b.quartech_programclosedate).getTime()
      : 0;
    return bClose - aClose;
  });

  let resultHtml = '';

  programs.forEach((program) => {
    const openDate = program.quartech_programopendate
      ? new Date(program.quartech_programopendate)
      : null;
    const closeDate = program.quartech_programclosedate
      ? new Date(program.quartech_programclosedate)
      : null;
    const openHtml = program.quartech_openhtmlcontent;
    const closedHtml = program.quartech_closedhtmlcontent;

    const hasOpenDateOnly = openDate && !closeDate && now >= openDate;
    const isOpenRange =
      openDate && closeDate && now >= openDate && now <= closeDate;
    const isClosed = closeDate && now > closeDate;

    if ((isOpenRange || hasOpenDateOnly) && openHtml) {
      resultHtml += openHtml;
    } else if (isClosed && closedHtml) {
      resultHtml += closedHtml;
    }
  });

  return resultHtml;
}
