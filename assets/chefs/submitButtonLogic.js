if (window.SubmissionIdSentToPodsOrSkipped) return;

const chefsFormLoadedInIframe = window.self !== window.top;

if (!chefsFormLoadedInIframe) {
  window.SubmissionIdSentToPodsOrSkipped = true;
  return;
}

const successHref = 'https://submit.digital.gov.bc.ca/app/form/success?s=';

const formSubmittedSuccessfully =
  window.location.href.indexOf(successHref) > -1;
if (!formSubmittedSuccessfully) return;

const submissionId = window.location.href.replace(successHref, '');

parent.postMessage(`{ "submissionId" : "${submissionId}" } `, '*');

window.SubmissionIdSentToPodsOrSkipped = true;
