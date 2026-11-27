/**
 * "Counter target spell if it would destroy a land you control" (Equinox):
 * the `spell-would-destroy` condition, judged as the ability resolves from
 * the target spell's own instructions — a `destroy` of a target still legal,
 * a `destroy-all` whose permanents include one — and not from anything a
 * choice, a "may" or a condition would decide (the card's rulings).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

function withEquinox() {
  const { game, a } = table();
  spawn(game, "Plains");
  // A land that makes no mana, so no spell's cost taps it.
  const land = spawn(game, "Maze of Ith");
  for (let i = 0; i < 4; i += 1) spawn(game, "Mountain");
  pickTargets(a, land);
  cast(game, toHand(game, "Equinox"), { targets: [ref(land)] });
  return { game, a, land };
}

/** The granted "{T}: Counter target spell …" on `land`, aimed at `spell`. */
function counterWith(game: Game, land: ObjectId, spell: ObjectId): void {
  const action = game
    .legalActions(A)
    .find((x) => x.kind === "activate-ability" && x.source === land && x.text.startsWith("{T}: Counter"));
  if (action === undefined || action.kind !== "activate-ability") throw new Error("no Equinox ability offered");
  game.dispatch({ type: "activate-ability", player: A, source: land, abilityIndex: action.abilityIndex, targets: [ref(spell)] });
  settle(game);
}

describe("Equinox", () => {
  it("counters a spell that would destroy a land its controller controls", () => {
    const { game, land } = withEquinox();
    const rain = toHand(game, "Stone Rain");
    cast(game, rain, { targets: [ref(land)], settle: false });
    counterWith(game, land, rain);
    expect(zone(game, rain)).toBe("graveyard");
    expect(zone(game, land)).toBe("battlefield");
  });

  it("counters a spell that destroys every land (destroy-all)", () => {
    const { game, land } = withEquinox();
    spawn(game, "Plains");
    const geddon = toHand(game, "Armageddon");
    cast(game, geddon, { targets: [], settle: false });
    counterWith(game, land, geddon);
    expect(zone(game, geddon)).toBe("graveyard");
    expect(zone(game, land)).toBe("battlefield");
  });

  it("doesn't counter a spell destroying only another player's land", () => {
    const { game, land } = withEquinox();
    const theirs = spawn(game, "Forest", B);
    const rain = toHand(game, "Stone Rain");
    cast(game, rain, { targets: [ref(theirs)], settle: false });
    counterWith(game, land, rain);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("doesn't counter a spell that destroys no land", () => {
    const { game, land } = withEquinox();
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    counterWith(game, land, bolt);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(17);
  });

  it("reads a destroy of an artifact-or-land target by what the target is", () => {
    const { game, land } = withEquinox();
    spawn(game, "Mountain");
    const pillage = toHand(game, "Pillage");
    cast(game, pillage, { targets: [ref(land)], settle: false });
    counterWith(game, land, pillage);
    expect(zone(game, land)).toBe("battlefield");
  });
});
