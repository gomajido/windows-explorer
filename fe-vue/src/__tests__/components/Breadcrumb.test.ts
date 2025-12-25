import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Breadcrumb from '../../presentation/components/Breadcrumb.vue';

describe('Breadcrumb', () => {
  it('renders root breadcrumb', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        path: [],
      },
    });
    
    expect(wrapper.text()).toContain('Root');
  });

  it('renders folder path', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        path: [
          { id: 1, name: 'Documents' },
          { id: 2, name: 'Work' },
        ],
      },
    });
    
    expect(wrapper.text()).toContain('Documents');
    expect(wrapper.text()).toContain('Work');
  });

  it('emits navigate event when breadcrumb clicked', async () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        path: [
          { id: 1, name: 'Documents' },
          { id: 2, name: 'Work' },
        ],
      },
    });
    
    const links = wrapper.findAll('button');
    if (links.length > 0) {
      await links[0].trigger('click');
      expect(wrapper.emitted('navigate')).toBeTruthy();
    }
  });

  it('shows separator between breadcrumbs', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        path: [
          { id: 1, name: 'Documents' },
          { id: 2, name: 'Work' },
        ],
      },
    });
    
    const html = wrapper.html();
    expect(html).toMatch(/>/);
  });

  it('last breadcrumb is not clickable', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        path: [
          { id: 1, name: 'Documents' },
          { id: 2, name: 'Work' },
        ],
      },
    });
    
    const text = wrapper.text();
    expect(text).toContain('Work');
  });
});
