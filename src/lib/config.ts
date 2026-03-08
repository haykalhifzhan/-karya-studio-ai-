// src/lib/config.ts
export const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
export const DASHSCOPE_BASE_URL = process.env.DASHSCOPE_BASE_URL;
export const QWEN_IMAGE_EDIT_MODEL = process.env.QWEN_IMAGE_EDIT_MODEL || 'qwen-image-edit-max';
export const DEFAULT_IMAGE_EDIT_SIZE = process.env.DEFAULT_IMAGE_EDIT_SIZE || '1024x1024';
export const IMAGE_EDIT_QUALITY = process.env.IMAGE_EDIT_QUALITY || 'high';
export const IMAGE_EDIT_FORMAT = process.env.IMAGE_EDIT_FORMAT || 'png';
export const IMAGE_EDIT_TIMEOUT_MS = parseInt(process.env.IMAGE_EDIT_TIMEOUT_MS || '120000');
