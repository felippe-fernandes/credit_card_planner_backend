import { PaginationHelper, PaginationMetaDto, SortOrder } from './pagination.dto';

describe('PaginationHelper', () => {
  describe('calculateMeta', () => {
    it('should calculate meta for first page', () => {
      const meta = PaginationHelper.calculateMeta(1, 10, 50);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('should calculate meta for middle page', () => {
      const meta = PaginationHelper.calculateMeta(3, 10, 50);

      expect(meta).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('should calculate meta for last page', () => {
      const meta = PaginationHelper.calculateMeta(5, 10, 50);

      expect(meta).toEqual({
        page: 5,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it('should handle single page', () => {
      const meta = PaginationHelper.calculateMeta(1, 10, 5);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should handle empty results', () => {
      const meta = PaginationHelper.calculateMeta(1, 10, 0);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should handle partial last page', () => {
      const meta = PaginationHelper.calculateMeta(3, 10, 25);

      expect(meta).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });
  });

  describe('calculateSkip', () => {
    it('should calculate skip for first page', () => {
      const skip = PaginationHelper.calculateSkip(1, 10);
      expect(skip).toBe(0);
    });

    it('should calculate skip for second page', () => {
      const skip = PaginationHelper.calculateSkip(2, 10);
      expect(skip).toBe(10);
    });

    it('should calculate skip for fifth page', () => {
      const skip = PaginationHelper.calculateSkip(5, 10);
      expect(skip).toBe(40);
    });

    it('should calculate skip with different limit', () => {
      const skip = PaginationHelper.calculateSkip(3, 25);
      expect(skip).toBe(50);
    });
  });

  describe('SortOrder', () => {
    it('should have ASC value', () => {
      expect(SortOrder.ASC).toBe('asc');
    });

    it('should have DESC value', () => {
      expect(SortOrder.DESC).toBe('desc');
    });
  });
});
