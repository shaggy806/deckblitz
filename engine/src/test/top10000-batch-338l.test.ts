/**
 * B338, the casting-zones lane: Psychic Rebuttal (`copy-spell`'s
 * `asLastOnStack`, the spell countered this way copied as it last was on the
 * stack), Guild Feud (an opponent's look-and-choose through `as-player`, the
 * two put onto the battlefield fighting), Arcanum Wings (aura swap, rule
 * 702.65 — `auraSwap()`). Written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  graveyard,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

/** Bob's Lightning Bolt aimed at Alice, left on the stack with Alice to act. */
const boltAtAlice = (game: Game): ObjectId => {
  lands(game, "Mountain", 1, B);
  lands(game, "Island", 2);
  // Alice's own instant, so Bob gets priority with something on the stack.
  cast(game, toHand(game, "Opt"), { settle: false });
  game.dispatch({ type: "pass-priority", player: A });
  const bolt = toHand(game, "Lightning Bolt", B);
  cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
  game.dispatch({ type: "pass-priority", player: B });
  return bolt;
};

const mastery = (game: Game): void => {
  toGraveyard(game, "Opt");
  toGraveyard(game, "Divination");
};

describe("Psychic Rebuttal", () => {
  it("counters an instant aimed at you; without spell mastery, no copy", () => {
    const { game } = table();
    const bolt = boltAtAlice(game);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Psychic Rebuttal"), { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("with spell mastery, you may copy the countered spell and aim the copy anew", () => {
    const { game, a } = table();
    mastery(game);
    const bolt = boltAtAlice(game);
    lands(game, "Island", 2);
    pickModes(a, 0);
    pickTargets(a, B);
    cast(game, toHand(game, "Psychic Rebuttal"), { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
    // The copy ceased to exist; the card is Bob's, in his graveyard.
    expect(graveyard(game, B)).toContain(bolt);
  });

  it("declining the copy copies nothing", () => {
    const { game, a } = table();
    mastery(game);
    const bolt = boltAtAlice(game);
    lands(game, "Island", 2);
    pickModes(a);
    cast(game, toHand(game, "Psychic Rebuttal"), { targets: [ref(bolt)] });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("a copy kept on its old target hits you", () => {
    const { game, a } = table();
    mastery(game);
    const bolt = boltAtAlice(game);
    lands(game, "Island", 2);
    pickModes(a, 0);
    pickTargets(a, A);
    cast(game, toHand(game, "Psychic Rebuttal"), { targets: [ref(bolt)] });
    expect(life(game, A)).toBe(17);
  });

  it("can't target a spell that doesn't target you", () => {
    const { game } = table();
    lands(game, "Mountain", 1, B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Opt"), { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(B)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    expect(() => cast(game, toHand(game, "Psychic Rebuttal"), { targets: [ref(bolt)] })).toThrow(/target/i);
  });
});

describe("Guild Feud", () => {
  /** Guild Feud on Alice's side, three cards on each library's top (Bob's
   * under one more he draws on his turn), then on to Alice's next upkeep. */
  const feud = (game: Game, mine: readonly string[], theirs: readonly string[]): { mine: ObjectId[]; theirs: ObjectId[] } => {
    spawn(game, "Guild Feud");
    const t = theirs.map((name) => toLibrary(game, name, B));
    toLibrary(game, "Wastes", B);
    const m = mine.map((name) => toLibrary(game, name, A));
    return { mine: m, theirs: t };
  };

  it("each puts a creature onto the battlefield, the rest into the graveyard, and the two fight", () => {
    const { game, a, b } = table();
    const { mine, theirs } = feud(game, ["Hill Giant", "Opt", "Wastes"], ["Grizzly Bears", "Opt", "Wastes"]);
    pickFromZone(a, mine[0]);
    pickFromZone(b, theirs[0]);
    toStep(game, "upkeep");
    settle(game);
    // The opponent's Bears entered under their control, then died fighting.
    expect(zone(game, theirs[0])).toBe("graveyard");
    expect(zone(game, mine[0])).toBe("battlefield");
    expect(controller(game, mine[0])).toBe(A);
    expect(game.state.objects[mine[0]].damageMarked).toBe(2);
    expect(zone(game, mine[1])).toBe("graveyard");
    expect(zone(game, theirs[1])).toBe("graveyard");
    expect(zone(game, mine[2])).toBe("graveyard");
  });

  it("the opponent's creature is theirs", () => {
    const { game, b } = table();
    const { theirs } = feud(game, ["Opt", "Opt", "Wastes"], ["Grizzly Bears", "Opt", "Wastes"]);
    pickFromZone(b, theirs[0]);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, theirs[0])).toBe("battlefield");
    expect(controller(game, theirs[0])).toBe(B);
    // No second creature, no fight.
    expect(game.state.objects[theirs[0]].damageMarked).toBe(0);
  });

  it("with only your creature put there, nothing fights", () => {
    const { game, a } = table();
    const { mine, theirs } = feud(game, ["Hill Giant", "Opt", "Wastes"], ["Grizzly Bears", "Opt", "Wastes"]);
    pickFromZone(a, mine[0]);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, theirs[0])).toBe("graveyard");
    expect(zone(game, mine[0])).toBe("battlefield");
    expect(game.state.objects[mine[0]].damageMarked).toBe(0);
  });
});

describe("Arcanum Wings", () => {
  const wingsOn = (game: Game): { bears: ObjectId; wings: ObjectId } => {
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 5);
    const wings = toHand(game, "Arcanum Wings");
    cast(game, wings, { targets: [ref(bears)] });
    return { bears, wings };
  };

  it("gives flying, and aura swap exchanges it with an Aura card in hand", () => {
    const { game, a } = table();
    const { bears, wings } = wingsOn(game);
    expect(keywords(game, bears).has("flying")).toBe(true);
    const shroud = toHand(game, "Spectral Flight");
    pickFromZone(a, shroud);
    activate(game, wings, 0);
    expect(zone(game, wings)).toBe("hand");
    expect(zone(game, shroud)).toBe("battlefield");
    expect(game.state.objects[shroud].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("an Aura that can't enchant that creature stays in hand, and so does nothing else", () => {
    const { game, a } = table();
    const { bears, wings } = wingsOn(game);
    const growth = toHand(game, "Wild Growth");
    pickFromZone(a, growth);
    activate(game, wings, 0);
    expect(zone(game, growth)).toBe("hand");
    expect(zone(game, wings)).toBe("battlefield");
    expect(game.state.objects[wings].attachedTo).toBe(bears);
  });

  it("choosing no card exchanges nothing", () => {
    const { game } = table();
    const { wings } = wingsOn(game);
    toHand(game, "Spectral Flight");
    activate(game, wings, 0);
    expect(zone(game, wings)).toBe("battlefield");
  });
});
