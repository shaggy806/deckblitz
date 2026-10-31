/**
 * `ofChosenColor` — a filter clause "of the chosen color", read off the
 * colour chosen for the permanent applying it as it entered (its
 * `chosenOnEnter`): a target slot (Pentarch Paladin), a cast trigger (Curse
 * of Wizardry) and a source of your choice (Story Circle), whose prevention
 * shield keeps the colour chosen as it resolved (rule 608.2h).
 */
import { describe, expect, it } from "vitest";
import { matchesFilter } from "../filter.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  lands,
  life,
  pickPermanents,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("ofChosenColor", () => {
  it("matches an object of the colour chosen for the source, nothing with none chosen", () => {
    const { game } = table();
    const curse = spawn(game, "Curse of Wizardry");
    const bolt = toHand(game, "Lightning Bolt");
    const bears = spawn(game, "Grizzly Bears");
    const reg = registryOf(game);
    const asks = (id: ObjectId) =>
      matchesFilter(game.state, reg, id, { ofChosenColor: true }, { you: A, source: curse });
    expect(asks(bolt)).toBe(false);
    game.state.objects[curse].chosenOnEnter = "R";
    expect(asks(bolt)).toBe(true);
    expect(asks(bears)).toBe(false);
    // With no source to read, nothing.
    expect(matchesFilter(game.state, reg, bolt, { ofChosenColor: true }, { you: A })).toBe(false);
  });

  it("reads a source that has left the battlefield as it last was (608.2h)", () => {
    const { game } = table();
    const curse = spawn(game, "Curse of Wizardry");
    game.state.objects[curse].chosenOnEnter = "G";
    const bears = spawn(game, "Grizzly Bears");
    game.debugMove(curse, "graveyard");
    expect(zone(game, curse)).toBe("graveyard");
    expect(
      matchesFilter(game.state, registryOf(game), bears, { ofChosenColor: true }, { you: A, source: curse }),
    ).toBe(true);
  });
});

describe("Pentarch Paladin", () => {
  it("can target only a permanent of the chosen color", () => {
    const { game } = table();
    const paladin = spawn(game, "Pentarch Paladin");
    game.state.objects[paladin].chosenOnEnter = "G";
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    lands(game, "Plains", 2);
    activate(game, paladin, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, goblin)).toBe("battlefield");
  });

  it("refuses a permanent of another color", () => {
    const { game } = table();
    const paladin = spawn(game, "Pentarch Paladin");
    game.state.objects[paladin].chosenOnEnter = "G";
    const goblin = spawn(game, "Raging Goblin", B);
    lands(game, "Plains", 2);
    expect(() => activate(game, paladin, 0, { targets: [ref(goblin)] })).toThrow();
  });
});

describe("Curse of Wizardry", () => {
  it("makes whoever casts a spell of the chosen color lose 1 life, its controller included", () => {
    const { game } = table();
    const curse = spawn(game, "Curse of Wizardry", B);
    game.state.objects[curse].chosenOnEnter = "R";
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(17);
  });

  it("ignores a spell of another color", () => {
    const { game } = table();
    const curse = spawn(game, "Curse of Wizardry", B);
    game.state.objects[curse].chosenOnEnter = "U";
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(20);
  });
});

describe("Story Circle", () => {
  /** Bob's Raging Goblin attacks alice; she activates the Circle as
   * blockers are declared. */
  function goblinAttack(chosen: string): { game: ReturnType<typeof table>["game"]; offered: readonly string[] } {
    const { game, a, b } = table();
    const circle = spawn(game, "Story Circle");
    game.state.objects[circle].chosenOnEnter = chosen;
    lands(game, "Plains", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: goblin, defender: A }];
    game.advanceUntil(
      (s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.turn.number > 1,
    );
    const seen = pickPermanents(a, goblin);
    activate(game, circle, 0, { player: A, settle: false });
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    settle(game);
    return { game, offered: seen.offered };
  }

  it("prevents the next damage from a source of the chosen color, offering only those", () => {
    const { game, offered } = goblinAttack("R");
    expect(offered.length).toBe(1);
    expect(life(game, A)).toBe(20);
  });

  it("offers no source of another color, so the damage is dealt", () => {
    const { game, offered } = goblinAttack("U");
    expect(offered.length).toBe(0);
    expect(life(game, A)).toBe(19);
  });
});
