/**
 * A token copy "except it's 1/1 and has toxic 1" (Kinzu of the Bleak Coven):
 * `CopyExceptions.toxic`, one more toxic instance in the copiable values
 * (rules 707.9b, 702.164b — cumulative with any toxic it copied), behind a
 * "may pay 2 life and exile it. If you do" (`costLife` on the `may`; not
 * offered below 2 life, rule 119.4). The copy is of the creature as it last
 * existed on the battlefield (rule 608.2h).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import { A, B, destroy, life, pt, spawn, table, zone } from "./harness.js";

const tokens = (game: Game): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken === true && game.state.objects[id].controller === A);

const toxicOf = (game: Game, id: ObjectId): number => game.characteristics(id).toxic;

describe("Kinzu of the Bleak Coven", () => {
  it("pays 2 life, exiles the card and makes a 1/1 copy with toxic 1", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    spawn(game, "Kinzu of the Bleak Coven");
    const giant = spawn(game, "Hill Giant");
    destroy(game, giant);
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, A)).toBe(18);
    const [token] = tokens(game);
    expect(nameOf(game.state.objects[token])).toBe("Hill Giant");
    expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
    expect(toxicOf(game, token)).toBe(1);
  });

  it("adds its toxic 1 to toxic the creature had (702.164b)", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    spawn(game, "Kinzu of the Bleak Coven");
    const syphoner = spawn(game, "Pestilent Syphoner");
    expect(toxicOf(game, syphoner)).toBe(1);
    destroy(game, syphoner);
    const [token] = tokens(game);
    expect(toxicOf(game, token)).toBe(2);
  });

  it("declined, the card stays and no life is paid", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [];
    spawn(game, "Kinzu of the Bleak Coven");
    const giant = spawn(game, "Hill Giant");
    destroy(game, giant);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(tokens(game)).toHaveLength(0);
  });

  it("doesn't see a token or an opponent's creature die", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    spawn(game, "Kinzu of the Bleak Coven");
    destroy(game, spawn(game, "Hill Giant", B));
    expect(asked).toBe(0);
    expect(life(game, A)).toBe(20);
  });
});
