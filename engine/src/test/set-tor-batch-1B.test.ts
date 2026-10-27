/**
 * Torment (TOR; B220) — group B: threshold, flashback and the Nightmares.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  graveyard,
  hand,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
  type BlockOffer,
} from "./harness.js";

const fillGraveyard = (game: Parameters<typeof spawn>[0], n = 7): void => {
  for (let i = 0; i < n; i++) toGraveyard(game, "Wastes");
};

describe("Krosan Restorer", () => {
  it("untaps up to three lands only with threshold", () => {
    const { game } = table();
    const restorer = spawn(game, "Krosan Restorer");
    const forests = lands(game, "Forest", 3);
    for (const f of forests) game.state.objects[f].tapped = true;
    expect(() => activate(game, restorer, 1, { targets: forests.map(ref) })).toThrow();
    fillGraveyard(game);
    activate(game, restorer, 1, { targets: forests.map(ref) });
    for (const f of forests) expect(game.state.objects[f].tapped).toBe(false);
  });
});

describe("Cleansing Meditation", () => {
  it("without threshold destroys every enchantment", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const mine = spawn(game, "Glorious Anthem");
    const theirs = spawn(game, "Glorious Anthem", B);
    cast(game, toHand(game, "Cleansing Meditation"));
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("with threshold returns only your own destroyed cards", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    fillGraveyard(game);
    const mine = spawn(game, "Glorious Anthem");
    const theirs = spawn(game, "Glorious Anthem", B);
    cast(game, toHand(game, "Cleansing Meditation"));
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Last Laugh", () => {
  it("pings everything when another permanent dies, and goes once no creature is left", () => {
    const { game } = table();
    const laugh = spawn(game, "Last Laugh");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    destroy(game, bears);
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(zone(game, laugh)).toBe("battlefield");
    destroy(game, giant);
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(zone(game, laugh)).toBe("graveyard");
  });
});

describe("False Memories", () => {
  it("mills seven, then exiles seven from your graveyard at the next end step", () => {
    const { game } = table();
    lands(game, "Island", 2);
    cast(game, toHand(game, "False Memories"));
    expect(graveyard(game, A).length).toBe(8);
    toStep(game, "end");
    settle(game);
    expect(graveyard(game, A).length).toBe(1);
  });
});

describe("Spirit Flare", () => {
  it("taps your creature, which deals its power to a blocking creature", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 4);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions", B);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = () => [{ blocker: lions, attacker: bears }];
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Spirit Flare"), { targets: [ref(giant), ref(lions)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(zone(game, lions)).toBe("graveyard");
  });
});

describe("Flash of Defiance", () => {
  it("by flashback, green and white creatures can't block", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Hill Giant", B);
    cast(game, toGraveyard(game, "Flash of Defiance"), { via: "flashback" });
    expect(life(game, A)).toBe(17);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.turn.step === "combat-damage");
    const offer = game.legalActions(B).find((o): o is BlockOffer => o.kind === "declare-blockers");
    const can = (id: string): readonly string[] => offer?.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(can(bears)).toEqual([]);
    expect(can(ogre)).toEqual([giant]);
  });
});

describe("Possessed Aven", () => {
  it("with threshold is a black 4/4 that can destroy a blue creature", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const aven = spawn(game, "Possessed Aven");
    const drake = spawn(game, "Wind Drake", B);
    expect([...computeCharacteristics(game.state, registryOf(game), aven).colors]).toEqual(["U"]);
    fillGraveyard(game);
    expect(pt(game, aven)).toEqual({ power: 4, toughness: 4 });
    expect([...computeCharacteristics(game.state, registryOf(game), aven).colors]).toEqual(["B"]);
    activate(game, aven, 0, { targets: [ref(drake)] });
    expect(zone(game, drake)).toBe("graveyard");
  });
});

describe("Balthor the Stout", () => {
  it("pumps other Barbarians, and one more by {R}", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Swamp", 1, B); // Barbarian Outcast's upkeep of a Swamp
    const outcast = spawn(game, "Barbarian Outcast", B);
    const before = pt(game, outcast);
    const balthor = spawn(game, "Balthor the Stout");
    expect(pt(game, balthor)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, outcast)).toEqual({ power: before.power + 1, toughness: before.toughness + 1 });
    activate(game, balthor, 0, { targets: [ref(outcast)] });
    expect(pt(game, outcast)).toEqual({ power: before.power + 2, toughness: before.toughness + 1 });
  });
});

describe("Hypochondria", () => {
  it("discards a card to prevent the next 3 damage", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1);
    const hypo = spawn(game, "Hypochondria");
    const before = hand(game, A).length;
    activate(game, hypo, 0, { targets: [ref(A)] });
    expect(hand(game, A).length).toBe(before - 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
  });
});

describe("Slithery Stalker", () => {
  it("exiles a green creature until it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const stalker = game.debugSpawn("Slithery Stalker", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    destroy(game, stalker);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
