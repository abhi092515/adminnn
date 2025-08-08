import { RequestHandler } from 'express';
import { SeoUrl } from '../models/seoUrl.model';

// Helper type for our dynamic filters
type FilterQuery = {
    _id?: string;
    isActive?: boolean;
    customer_id?: string;
};


export const getAllSeoUrls: RequestHandler = async (req, res) => { 
  try { 
    const { customer_id } = req.body; 
    // ✅ FIX: Changed the filter to be empty by default to fetch ALL URLs.
    const filter: FilterQuery = {}; 
    if (customer_id) { 
      filter.customer_id = customer_id; 
    } 
    const urls = await SeoUrl.find(filter).sort({ createdAt: -1 }); 
    res.status(200).json(urls); 
  } catch (error) { 
    res.status(500).json({ message: 'Error fetching SEO URLs', error }); 
  } 
}; 

export const createSeoUrl: RequestHandler = async (req, res) => {
  try {
    const newUrl = await SeoUrl.create(req.body);
    res.status(201).json({ message: 'URL added successfully.', data: newUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error creating SEO URL', error });
  }
};

export const updateSeoUrl: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id } = req.body;
    const filter: FilterQuery = { _id: id };
    if (customer_id) {
      filter.customer_id = customer_id;
    }
    const updatedUrl = await SeoUrl.findOneAndUpdate(filter, req.body, { new: true });

    if (!updatedUrl) {
      // CORRECT PATTERN: Send response, then return to exit.
      res.status(404).json({ message: 'URL not found or you do not have permission to edit it.' });
      return;
    }
    res.status(200).json({ message: 'URL updated successfully.', data: updatedUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error updating SEO URL', error });
  }
};

export const deleteSeoUrl: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id } = req.body;
    const filter: FilterQuery = { _id: id };
    if (customer_id) {
      filter.customer_id = customer_id;
    }
    const deletedUrl = await SeoUrl.findOneAndUpdate(filter, { isActive: false }, { new: true });

    if (!deletedUrl) {
      // CORRECT PATTERN: Send response, then return to exit.
      res.status(404).json({ message: 'URL not found or you do not have permission to delete it.' });
      return;
    }
    res.status(200).json({ message: 'URL inactive successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting SEO URL', error });
  }
};

export const updatePriority: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { priority, customer_id } = req.body;
        const filter: FilterQuery = { _id: id };

        if (typeof priority !== 'number') {
            res.status(400).json({ message: 'Priority must be a number.' });
            return;
        }

        if (customer_id) {
          filter.customer_id = customer_id;
        }

        const updatedUrl = await SeoUrl.findOneAndUpdate(filter, { priority }, { new: true });

        if (!updatedUrl) {
            // CORRECT PATTERN: Send response, then return to exit.
            res.status(404).json({ message: 'URL not found or you do not have permission to edit it.' });
            return;
        }
        res.status(200).json({ message: 'Priority updated successfully.', data: updatedUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error updating priority', error });
    }
};
export const getSeoUrlById: RequestHandler = async (req, res) => { 
  try { 
    const { id } = req.params; 
    const url = await SeoUrl.findById(id); 

    if (!url) { 
      res.status(404).json({ message: 'URL not found.' }); 
      return; 
    } 
    // Important: We wrap it in a `data` property to match what the frontend hook expects
    res.status(200).json({ success: true, data: url }); 
  } catch (error) { 
    res.status(500).json({ message: 'Error fetching SEO URL', error }); 
  } 
};