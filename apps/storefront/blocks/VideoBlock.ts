import type { Block } from "payload"

export const VideoBlock: Block = {
  slug: "video",
  labels: { singular: "Video — YouTube sau Vimeo", plural: "Blocuri Video" },
  admin: { images: { thumbnail: { url: "/block-thumbnails/video.svg", alt: "Video block preview" } } },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "videoUrl",
      type: "text",
      required: true,
      admin: { description: "URL YouTube (https://youtube.com/watch?v=...) sau Vimeo (https://vimeo.com/...)" },
    },
    { name: "caption", type: "text" },
    {
      name: "aspectRatio",
      type: "select",
      defaultValue: "16/9",
      options: [
        { label: "16:9 (Standard)", value: "16/9" },
        { label: "4:3 (Clasic)", value: "4/3" },
        { label: "1:1 (Pătrat)", value: "1/1" },
        { label: "9:16 (Vertical / Reels)", value: "9/16" },
      ],
    },
  ],
}
