/**
 * SOQL Query Builder
 * 
 * Fluent interface for building SOQL queries
 */
class SoqlBuilder {
  constructor() {
    this.fields = [];
    this.objectName = '';
    this.conditions = [];
    this.orderByFields = [];
    this.limitCount = null;
    this.offsetCount = null;
    this.groupByFields = [];
    this.havingConditions = [];
  }

  /**
   * Select fields
   * @param {...string} fields - Fields to select
   * @returns {SoqlBuilder} This builder
   */
  select(...fields) {
    this.fields = fields.flat();
    return this;
  }

  /**
   * From object
   * @param {string} objectName - Object API name
   * @returns {SoqlBuilder} This builder
   */
  from(objectName) {
    this.objectName = objectName;
    return this;
  }

  /**
   * Where condition
   * @param {string} condition - Where condition
   * @returns {SoqlBuilder} This builder
   */
  where(condition) {
    this.conditions.push(condition);
    return this;
  }

  /**
   * AND condition
   * @param {string} condition - AND condition
   * @returns {SoqlBuilder} This builder
   */
  and(condition) {
    if (this.conditions.length === 0) {
      return this.where(condition);
    }
    this.conditions.push(condition);
    return this;
  }

  /**
   * Order by fields
   * @param {string} field - Field to order by
   * @param {string} [direction='ASC'] - Sort direction
   * @returns {SoqlBuilder} This builder
   */
  orderBy(field, direction = 'ASC') {
    this.orderByFields.push(`${field} ${direction}`);
    return this;
  }

  /**
   * Limit results
   * @param {number} count - Limit count
   * @returns {SoqlBuilder} This builder
   */
  limit(count) {
    this.limitCount = count;
    return this;
  }

  /**
   * Offset results
   * @param {number} count - Offset count
   * @returns {SoqlBuilder} This builder
   */
  offset(count) {
    this.offsetCount = count;
    return this;
  }

  /**
   * Group by fields
   * @param {...string} fields - Fields to group by
   * @returns {SoqlBuilder} This builder
   */
  groupBy(...fields) {
    this.groupByFields = fields.flat();
    return this;
  }

  /**
   * Having condition
   * @param {string} condition - Having condition
   * @returns {SoqlBuilder} This builder
   */
  having(condition) {
    this.havingConditions.push(condition);
    return this;
  }

  /**
   * Build SOQL query
   * @returns {string} SOQL query
   */
  build() {
    if (!this.objectName) {
      throw new Error('Object name is required');
    }
    
    if (this.fields.length === 0) {
      this.fields = ['Id'];
    }
    
    let query = `SELECT ${this.fields.join(', ')} FROM ${this.objectName}`;
    
    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    
    if (this.groupByFields.length > 0) {
      query += ` GROUP BY ${this.groupByFields.join(', ')}`;
    }
    
    if (this.havingConditions.length > 0) {
      query += ` HAVING ${this.havingConditions.join(' AND ')}`;
    }
    
    if (this.orderByFields.length > 0) {
      query += ` ORDER BY ${this.orderByFields.join(', ')}`;
    }
    
    if (this.limitCount !== null) {
      query += ` LIMIT ${this.limitCount}`;
    }
    
    if (this.offsetCount !== null) {
      query += ` OFFSET ${this.offsetCount}`;
    }
    
    return query;
  }
}

module.exports = SoqlBuilder;