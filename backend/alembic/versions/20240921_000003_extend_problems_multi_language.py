"""extend problems for multi-language and metadata

Revision ID: 20240921_000003
Revises: 20240921_000002
Create Date: 2025-09-22 01:05:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '20240921_000003'
down_revision = '20240921_000002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('problems', sa.Column('solution_snippets', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('problems', sa.Column('default_language', sa.String(length=20), nullable=True))
    op.add_column('problems', sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True))
    op.add_column('problems', sa.Column('editorial', sa.Text(), nullable=True))

    # backfill default_language and solution_snippets using existing columns
    op.execute(
        """
        UPDATE problems
        SET default_language = solution_language,
            solution_snippets = jsonb_build_object(
                solution_language,
                jsonb_build_object('code', solution_code, 'explanation', NULL)
            )
        WHERE solution_language IS NOT NULL
        """
    )


def downgrade() -> None:
    op.drop_column('problems', 'editorial')
    op.drop_column('problems', 'tags')
    op.drop_column('problems', 'default_language')
    op.drop_column('problems', 'solution_snippets')

