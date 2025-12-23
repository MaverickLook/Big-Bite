import express from "express";
import Food from "../models/food.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    if (foods.length > 0) {
      const sampleFood = foods[0].toObject ? foods[0].toObject() : foods[0];
      console.log(`[Food API] Returning ${foods.length} foods. Sample item has category:`, {
        name: sampleFood.name,
        category: sampleFood.category,
        hasCategoryField: 'category' in sampleFood
      });
    }
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async(req,res) => {
    try{
        const food = await Food.findById(req.params.id);

        if(!food){
            return res.status(404).json({message:"Food not found"});
        }
        res.json(food);
    }catch(err){
        res.status(400).json({message: "Invalid Food ID format"});
    }
});


router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const food = await Food.create(req.body);
    const foodObj = food.toObject ? food.toObject() : food;
    console.log('[Food API] Created food item:', {
      name: foodObj.name,
      category: foodObj.category,
      hasCategory: 'category' in foodObj
    });
    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    // Ensure category is included in response
    const updatedObj = updated.toObject ? updated.toObject() : updated;
    console.log('[Food API] Updated food item:', {
      name: updatedObj.name,
      category: updatedObj.category,
      hasCategory: 'category' in updatedObj
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
