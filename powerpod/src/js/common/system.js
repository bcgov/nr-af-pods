import { getGlobalConfigData } from "./config.js";

export function addNewAppSystemNotice() {
  const newAppSystemNoticeDiv = document.createElement('div');
  newAppSystemNoticeDiv.id = `new_app_system_notice_div`;
  // @ts-ignore
  newAppSystemNoticeDiv.style = 'float: left;';
  const systemNotice = getGlobalConfigData()?.SystemNotice;
  newAppSystemNoticeDiv.innerHTML = systemNotice;

  const actionsDiv = $(`#NextButton`).parent().parent().parent();
  actionsDiv.append(newAppSystemNoticeDiv);
}
