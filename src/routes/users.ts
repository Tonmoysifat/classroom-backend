import express from "express";
import {and, desc, getTableColumns, ilike, or, eq, sql} from "drizzle-orm";
import {user} from "../db/schema/index.js";
import {db} from "../db/index.js";

const router = express.Router();

// Get all users with optional search filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {search, role, page = 1, limit = 10} = req.query;

    const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
    const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100); // Max 100 records per page

    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions: any[] = [];

    if (search) {
      filterConditions.push(
        or(
          ilike(user.name, `%${String(search)}%`),
          ilike(user.email, `%${String(search)}%`),
        )
      );
    }

    if (role) {
      // filterConditions.push(eq(user.role, String(role)));
      filterConditions.push(eq(user.role, role as UserRoles));
    }

    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db.select({count: sql<number>`count(*)`}).from(user).where(whereClause);
    const totalCount = countResult[0]?.count ?? 0;

    const usersList = await db.select({
      ...getTableColumns(user),
    })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: usersList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });

  } catch (e) {
    console.error("Error in get /users", e)
    res.status(500).json({error: "Failed to get users"})
  }
})

export default router;

