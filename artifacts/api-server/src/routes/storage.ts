import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  const { name, size, contentType, file_base64 } = req.body;
  if (!name || !size || !contentType || !file_base64) {
    res.status(400).json({ error: "Missing required fields (name, size, contentType, file_base64)" });
    return;
  }

  try {
    const objectPath = `data:${contentType};base64,${file_base64}`;
    res.json({
      uploadURL: null,
      objectPath,
      metadata: { name, size, contentType },
    });
  } catch (error) {
    req.log.error({ err: error }, "Error handling upload");
    res.status(500).json({ error: "Failed to process upload" });
  }
});

router.get("/storage/public-objects/*filePath", async (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not supported" });
});

router.get("/storage/objects/*path", async (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not supported" });
});

export default router;
