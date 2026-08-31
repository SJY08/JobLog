export interface CoverLetterSection {
  id: string;
  title: string;
  body: string;
  locked?: boolean;
}

export interface CoverLetter {
  applicantName: string;
  targetCompany: string;
  targetPosition: string;
  sections: CoverLetterSection[];
  updatedAt: string;
}
