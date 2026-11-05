/**
 * Batch 259's lead card: Sorin, Vengeful Bloodlord, which found that a source's
 * lifelink and deathtouch were read only on a creature (rules 702.15b, 702.2b).
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  counters,
  destroy,
  keywords,
  life,
  loyalty,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toStep,
  zone,
} from "./harness.js";

describe("Sorin, Vengeful Bloodlord", () => {
  it("+2: his own damage gains life, a noncreature source's lifelink (rule 702.15b)", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin, Vengeful Bloodlord");
    const [ours, theirs] = [life(game, A), life(game, B)];
    loyalty(game, sorin, 2, { targets: [ref(B)] });
    expect(life(game, B)).toBe(theirs - 1);
    expect(life(game, A)).toBe(ours + 1);
    expect(counters(game, sorin, "loyalty")).toBe(6);
  });

  it("+2: still gains life when he left before it resolved (his ruling)", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin, Vengeful Bloodlord");
    const ours = life(game, A);
    loyalty(game, sorin, 2, { targets: [ref(B)], settle: false });
    destroy(game, sorin);
    expect(zone(game, sorin)).toBe("graveyard");
    expect(life(game, A)).toBe(ours + 1);
  });

  it("lifelink only during your turn, on your creatures and planeswalkers, not an opponent's", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin, Vengeful Bloodlord");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(keywords(game, sorin).has("lifelink")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(keywords(game, theirs).has("lifelink")).toBe(false);
    toStep(game, "precombat-main", B);
    expect(keywords(game, bears).has("lifelink")).toBe(false);
  });

  it("−X: only a creature card of mana value exactly X, and it comes back a Vampire too", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin, Vengeful Bloodlord");
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => loyalty(game, sorin, "-x", { x: 1, targets: [ref(bears)] })).toThrow();
    loyalty(game, sorin, "-x", { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Vampire"]));
    expect(counters(game, sorin, "loyalty")).toBe(2);
  });
});
