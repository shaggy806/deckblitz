/**
 * "A source of your choice" (rule 609.7) with a recipient other than you or a
 * target, for the turn or the next time: all its damage to anything (Prahv,
 * Burrenton Forge-Tender), its next damage to anything (Pilgrim of Virtue), a
 * redirection of it to the ability's source (Opal-Eye, rule 614.9), "you and/or
 * creatures you control" and life gained only from some sources (Shadowbane,
 * Samite Ministration).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, activate, cast, lands, life, pickPermanents, ref, spawn, table, toHand } from "./harness.js";

/** `source` deals `amount` damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount = 2): void => {
  game.debugApplyEffect(
    game.state.objects[source].controller,
    { kind: "damage", amount, target: 0 },
    [to],
    { source },
  );
};
const marked = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("all the damage a chosen source would deal this turn", () => {
  it("Prahv stops all of it, to anything, and not another source's", () => {
    const { game, a } = table();
    const prahv = spawn(game, "Prahv, Spires of Order");
    lands(game, "Plains", 3);
    lands(game, "Island", 3);
    const goblin = spawn(game, "Raging Goblin", B);
    const other = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, goblin);
    activate(game, prahv, 1);
    expect(seen.offered).toContain(goblin);
    hit(game, goblin, ref(A));
    hit(game, goblin, ref(A));
    hit(game, goblin, ref(bears));
    hit(game, goblin, ref(B));
    expect(life(game, A)).toBe(20);
    expect(marked(game, bears)).toBe(0);
    // Even to its own controller: "would deal", to anything.
    expect(life(game, B)).toBe(20);
    hit(game, other, ref(A));
    expect(life(game, A)).toBe(18);
  });

  it("Burrenton Forge-Tender: only a red source, rechecked (609.7b), and it costs the creature", () => {
    const { game, a } = table();
    const tender = spawn(game, "Burrenton Forge-Tender");
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a, goblin);
    activate(game, tender, 0);
    expect(game.state.objects[tender].zone).toBe("graveyard");
    expect(seen.offered).toContain(goblin);
    expect(seen.offered).not.toContain(bears);
    hit(game, goblin, ref(A));
    hit(game, goblin, ref(A));
    expect(life(game, A)).toBe(20);
    // Thoughtlace turns it blue: the shield no longer applies.
    lands(game, "Island", 1);
    cast(game, toHand(game, "Thoughtlace"), { targets: [ref(goblin)] });
    hit(game, goblin, ref(A));
    expect(life(game, A)).toBe(18);
  });

  it("Burrenton Forge-Tender's own protection from red still works", () => {
    const { game } = table();
    const tender = spawn(game, "Burrenton Forge-Tender");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(tender));
    expect(marked(game, tender)).toBe(0);
  });

  it("a permanent spell chosen is covered as the permanent it becomes (609.7a)", () => {
    const { game, a } = table();
    const prahv = spawn(game, "Prahv, Spires of Order");
    lands(game, "Plains", 3);
    lands(game, "Island", 3);
    lands(game, "Mountain", 1);
    const goblinCard = toHand(game, "Raging Goblin");
    cast(game, goblinCard, { settle: false });
    pickPermanents(a, goblinCard);
    // Settling resolves the ability, then the Goblin.
    activate(game, prahv, 1);
    expect(game.state.objects[goblinCard].zone).toBe("battlefield");
    hit(game, goblinCard, ref(B));
    expect(life(game, B)).toBe(20);
  });
});

describe("the next time a chosen source would deal damage, to anything", () => {
  it("Pilgrim of Virtue stops one hit, wherever it goes, black sources only", () => {
    const { game, a } = table();
    const pilgrim = spawn(game, "Pilgrim of Virtue");
    lands(game, "Plains", 1);
    const zombie = spawn(game, "Walking Corpse", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, zombie);
    activate(game, pilgrim, 0);
    expect(seen.offered).not.toContain(goblin);
    hit(game, zombie, ref(bears));
    expect(marked(game, bears)).toBe(0);
    hit(game, zombie, ref(bears));
    expect(marked(game, bears)).toBe(2);
  });
});

describe("a redirection of a chosen source's next damage (rule 614.9)", () => {
  it("Opal-Eye takes the next damage that source would deal to anything", () => {
    const { game, a } = table();
    const opal = spawn(game, "Opal-Eye, Konda's Yojimbo");
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    activate(game, opal, 0);
    expect(game.state.objects[opal].tapped).toBe(true);
    hit(game, goblin, ref(A));
    expect(life(game, A)).toBe(20);
    expect(marked(game, opal)).toBe(2);
    // Once.
    hit(game, goblin, ref(A));
    expect(life(game, A)).toBe(18);
    expect(marked(game, opal)).toBe(2);
  });

  it("reaches damage to anyone, the same source dealing it (its protection reads that source)", () => {
    const { game, a } = table();
    const opal = spawn(game, "Opal-Eye, Konda's Yojimbo");
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, goblin);
    activate(game, opal, 0);
    hit(game, goblin, ref(bears));
    expect(marked(game, bears)).toBe(0);
    expect(marked(game, opal)).toBe(2);
  });

  it("does nothing with Opal-Eye gone, and the damage lands where it was going", () => {
    const { game, a } = table();
    const opal = spawn(game, "Opal-Eye, Konda's Yojimbo");
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    activate(game, opal, 0);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(opal)]);
    expect(game.state.objects[opal].zone).toBe("graveyard");
    hit(game, goblin, ref(A));
    expect(life(game, A)).toBe(18);
  });

  it("its other ability prevents the next 1 damage to it", () => {
    const { game } = table();
    const opal = spawn(game, "Opal-Eye, Konda's Yojimbo");
    lands(game, "Plains", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, opal, 1);
    hit(game, goblin, ref(opal));
    expect(marked(game, opal)).toBe(1);
  });
});

describe("life from some sources, and you and/or creatures you control", () => {
  it("Shadowbane covers you and your creatures once, and not other recipients", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    cast(game, toHand(game, "Shadowbane"));
    // To their own creature and to their own face: not covered, not used up.
    hit(game, goblin, ref(theirs));
    expect(marked(game, theirs)).toBe(2);
    hit(game, goblin, ref(B));
    expect(life(game, B)).toBe(18);
    // A red source gains no life.
    hit(game, goblin, ref(bears));
    expect(marked(game, bears)).toBe(0);
    expect(life(game, A)).toBe(20);
    hit(game, goblin, ref(A));
    expect(life(game, A)).toBe(18);
  });

  it("Shadowbane doesn't cover a noncreature permanent you control", () => {
    const { game, a } = table();
    const walker = spawn(game, "Liliana of the Veil");
    lands(game, "Plains", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    const loyalty = game.state.objects[walker].counters.loyalty ?? 0;
    pickPermanents(a, goblin);
    cast(game, toHand(game, "Shadowbane"));
    hit(game, goblin, ref(walker));
    expect(game.state.objects[walker].counters.loyalty).toBe(loyalty - 2);
  });

  it("Shadowbane from a black source gains that much life", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const zombie = spawn(game, "Walking Corpse", B);
    pickPermanents(a, zombie);
    cast(game, toHand(game, "Shadowbane"));
    hit(game, zombie, ref(A), 3);
    expect(life(game, A)).toBe(23);
  });

  it("Samite Ministration gains life from black or red, each time, and not from green", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, goblin);
    cast(game, toHand(game, "Samite Ministration"));
    hit(game, goblin, ref(A));
    hit(game, goblin, ref(A));
    expect(life(game, A)).toBe(24);
    pickPermanents(a, bears);
    cast(game, toHand(game, "Samite Ministration"));
    hit(game, bears, ref(A));
    expect(life(game, A)).toBe(24);
    // "Dealt to you": its controller's own face is not covered.
    hit(game, goblin, ref(B));
    expect(life(game, B)).toBe(18);
  });
});
