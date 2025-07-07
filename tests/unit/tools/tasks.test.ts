import { describe, expect, it } from '@jest/globals';

describe('Tasks Tools', () => {
  it('should have the required tool functions exported', async () => {
    // This is a basic test to ensure the module can be imported
    // and has the expected exports
    const tasksModule = await import('../../../src/tools/tasks');
    
    expect(tasksModule.listTasks).toBeDefined();
    expect(tasksModule.getTask).toBeDefined();
    expect(tasksModule.createTask).toBeDefined();
    expect(tasksModule.updateTask).toBeDefined();
    expect(tasksModule.deleteTask).toBeDefined();
    
    expect(typeof tasksModule.listTasks.handler).toBe('function');
    expect(typeof tasksModule.getTask.handler).toBe('function');
    expect(typeof tasksModule.createTask.handler).toBe('function');
    expect(typeof tasksModule.updateTask.handler).toBe('function');
    expect(typeof tasksModule.deleteTask.handler).toBe('function');
  });

  it('should have proper tool metadata', async () => {
    const tasksModule = await import('../../../src/tools/tasks');
    
    expect(tasksModule.listTasks.name).toBe('list_tasks');
    expect(tasksModule.listTasks.description).toContain('tasks');
    
    expect(tasksModule.getTask.name).toBe('get_task');
    expect(tasksModule.getTask.description).toContain('task');
    
    expect(tasksModule.createTask.name).toBe('create_task');
    expect(tasksModule.createTask.description).toContain('create');
    
    expect(tasksModule.updateTask.name).toBe('update_task');
    expect(tasksModule.updateTask.description).toContain('update');
    
    expect(tasksModule.deleteTask.name).toBe('delete_task');
    expect(tasksModule.deleteTask.description).toContain('delete');
  });
});
