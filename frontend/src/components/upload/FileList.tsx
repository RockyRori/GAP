import React from "react";

interface Props {
  fileNames: string[];
  totalSamples: number;
}

export const FileList: React.FC<Props> = ({ fileNames, totalSamples }) => {
  if (fileNames.length === 0) {
    return <p>No files loaded yet.</p>;
  }

  return (
    <div className="gap-file-list">
      <h3>Loaded Files</h3>
      <ul>
        {fileNames.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p>Total samples parsed: {totalSamples}</p>
    </div>
  );
};
