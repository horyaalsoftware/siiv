"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  budget: z.coerce.number().positive("Budget must be a positive number"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
})

export async function createProject(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Unauthorized" }
    }

    const companyId = (session.user as any).companyId
    if (!companyId) {
      return { error: "User is not assigned to a company" }
    }

    const parsed = projectSchema.safeParse({
      name: formData.get("name"),
      location: formData.get("location"),
      budget: formData.get("budget"),
      status: formData.get("status") || "PENDING",
    })

    if (!parsed.success) {
      return { error: "Invalid form data" }
    }

    await db.project.create({
      data: {
        ...parsed.data,
        companyId,
      },
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to create project:", error)
    return { error: "Failed to create project" }
  }
}
