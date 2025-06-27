import React from 'react'
import { columns, DataTable } from '@/features/members';
import { getAllMembers } from '@/features/members/actions';


async function page() {
  const {errors, data: members} = await getAllMembers()
  if (errors) {
    return (
      <div>There is error nigga</div>
    )
  }
  const filteredMembers = (members || []).map(({ id, firstName, email, enrollments }) => ({
    id,
    firstName,
    email,
    enrollments,
  }));
  
  return (
    <div>
      <DataTable columns={columns} data={filteredMembers}/>
    </div>
  )
}

export default page