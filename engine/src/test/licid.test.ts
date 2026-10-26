/**
 * Licids (Tempest, Stronghold): "{cost}, {T}: This creature loses this ability and becomes an
 * Aura enchantment with enchant creature. Attach it to target creature. You may pay {cost} to
 * end this effect." — `become-licid-aura`, `GameObject.licid`, and the `end-licid-effect`
 * special action (rule 116.2c), which nothing can respond to and after which its player keeps
 * priority (116.3).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  controller,
  destroy,
  graveyard,
  keywords,
  lands,
  life,
  nextTurn,
  ref,
  spawn,
  subtypes,
  table,
  toStep,
  types,
} from "./harness.js";

describe("Licids", () => {
  it("becomes an Aura on the target creature, and loses that ability", () => {
    const { game } = table();
    const licid = spawn(game, "Enraging Licid");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    activate(game, licid, 0, { targets: [ref(bears)] });
    expect(game.state.objects[licid].attachedTo).toBe(bears);
    expect(types(game, licid)).toEqual(["enchantment"]);
    expect(subtypes(game, licid)).toEqual(["Aura"]);
    expect(keywords(game, bears).has("haste")).toBe(true);
    // Untapped again, it still doesn't have the ability.
    game.state.objects[licid].tapped = false;
    expect(game.canDispatch({ type: "activate-ability", player: A, source: licid, abilityIndex: 0, targets: [ref(bears)] })).toMatch(
      /lost that ability/,
    );
  });

  it("does nothing as a creature: its enchanted-creature text needs a host", () => {
    const { game } = table();
    spawn(game, "Enraging Licid");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("haste")).toBe(false);
  });

  it("ends the effect for its cost: a creature again, unattached, with its ability back", () => {
    const { game } = table();
    const licid = spawn(game, "Enraging Licid");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    activate(game, licid, 0, { targets: [ref(bears)] });
    const offer = game.legalActions(A).find((a) => a.kind === "end-licid-effect");
    expect(offer).toMatchObject({ permanent: licid, cost: "{R}" });
    game.dispatch({ type: "end-licid-effect", player: A, permanent: licid });
    expect(game.state.objects[licid].attachedTo).toBeNull();
    expect(types(game, licid)).toEqual(["creature"]);
    expect(subtypes(game, licid)).toEqual(["Licid"]);
    expect(keywords(game, bears).has("haste")).toBe(false);
    expect(game.state.priority.holder).toBe(A);
    game.state.objects[licid].tapped = false;
    activate(game, licid, 0, { targets: [ref(bears)] });
    expect(game.state.objects[licid].attachedTo).toBe(bears);
  });

  it("can't be ended without the mana, nor by anyone but the player who activated it", () => {
    const { game } = table();
    const licid = spawn(game, "Enraging Licid");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    activate(game, licid, 0, { targets: [ref(bears)] });
    expect(game.canDispatch({ type: "end-licid-effect", player: A, permanent: licid })).toMatch(/cannot pay/);
    lands(game, "Mountain", 1, B);
    expect(game.legalActions(B).some((a) => a.kind === "end-licid-effect")).toBe(false);
  });

  it("goes to the graveyard when the creature it enchants leaves (rule 704.5m)", () => {
    const { game } = table();
    const licid = spawn(game, "Quickening Licid");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    activate(game, licid, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    destroy(game, bears);
    toStep(game, "postcombat-main");
    expect(graveyard(game)).toContain(licid);
    // A new object in the graveyard: the effect ended with the permanent.
    expect(game.state.objects[licid].licid).toBeUndefined();
  });

  it("Dominating Licid takes the creature until the effect ends", () => {
    const { game } = table();
    const licid = spawn(game, "Dominating Licid");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 5);
    activate(game, licid, 0, { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    game.dispatch({ type: "end-licid-effect", player: A, permanent: licid });
    expect(controller(game, giant)).toBe(B);
    expect(controller(game, licid)).toBe(A);
  });

  it("Leeching Licid deals 1 damage to the enchanted creature's controller at their upkeep", () => {
    const { game } = table();
    const licid = spawn(game, "Leeching Licid");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    activate(game, licid, 0, { targets: [ref(bears)] });
    nextTurn(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("Nurturing Licid's regeneration works only once it's an Aura", () => {
    const { game } = table();
    const licid = spawn(game, "Nurturing Licid");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    activate(game, licid, 0, { targets: [ref(bears)] });
    activate(game, licid, 1);
    destroy(game, bears);
    toStep(game, "postcombat-main");
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(game.state.objects[licid].attachedTo).toBe(bears);
  });
});
