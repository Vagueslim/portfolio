import { useContent } from '../content';
import { assetPath } from '../content/localization';

export function CvLink() {
  const { profile } = useContent();
  return <a className="cv-link" href={assetPath(profile.cv.src)} download="dhittawat-thongkhum-cv.pdf">
    <span>{profile.cv.label} <span aria-hidden="true">↓</span></span>
    <small lang="en">{profile.cv.format}</small>
  </a>;
}
